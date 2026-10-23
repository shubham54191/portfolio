import os
# Folders: LP_WORK holds inputs/outputs (img/up.png, img/src.png, lm68.npy, out3/…), LP_MODELS the .onnx models.
WORK = os.environ.get('LP_WORK', 'work')
MODELS = os.environ.get('LP_MODELS', 'models')
import cv2, numpy as np, onnxruntime as ort, sys, os
from scipy.spatial.transform import Rotation as R
M=MODELS
opt=ort.SessionOptions(); opt.intra_op_num_threads=os.cpu_count()
S=lambda n: ort.InferenceSession(f'{M}/{n}.onnx', opt, providers=['CPUExecutionProvider'])
FFHQ=np.array([[0.37691676,0.46864664],[0.62285697,0.46912813],[0.50123859,0.61331904],[0.39308822,0.72541100],[0.61150205,0.72490465]])
def tp(pts, m): return cv2.transform(pts.reshape(1,-1,2).astype(np.float64), m)[0]

def landmarks68(img, bbox):
    fan=S('2dfan4')
    bbox=np.array(bbox,float)
    scale=195/(bbox[2:]-bbox[:2]).max()
    tr=(256-(bbox[2:]+bbox[:2])*scale)*0.5
    am=np.array([[scale,0,tr[0]],[0,scale,tr[1]]])
    crop=cv2.warpAffine(img,am,(256,256))
    x=crop.transpose(2,0,1).astype(np.float32)[None]/255.
    out=fan.run(None,{fan.get_inputs()[0].name:x})
    lm=out[0][:,:,:2][0]/64*256
    return tp(lm, cv2.invertAffineTransform(am))

def to5(l): return np.array([l[36:42].mean(0), l[42:48].mean(0), l[30], l[48], l[54]])
def rot(p,y,r): return R.from_euler('xyz',[p,y,r],degrees=True).as_matrix().astype(np.float32)
def ratio(l,t,b,le,ri): return float(np.linalg.norm(l[t]-l[b])/(np.linalg.norm(l[le]-l[ri])+1e-6))

class LP:
    def __init__(s, img, lm68):
        s.img=img; s.lm=lm68
        l5=to5(lm68); l5=(l5-l5[2])*1.5+l5[2]
        s.A=cv2.estimateAffinePartial2D(l5, FFHQ*512, method=cv2.RANSAC, ransacReprojThreshold=100)[0]
        crop=cv2.warpAffine(img,s.A,(512,512),borderMode=cv2.BORDER_REPLICATE,flags=cv2.INTER_AREA)
        bm=np.ones((512,512),np.float32); b=int(512*0.5*0.3); ba=max(b//2,1)
        bm[:ba]=0; bm[-ba:]=0; bm[:,:ba]=0; bm[:,-ba:]=0
        s.box=cv2.GaussianBlur(bm,(0,0),b*0.25)
        x=cv2.resize(crop,(256,256),interpolation=cv2.INTER_AREA)[:,:,::-1]/255.
        x=x.transpose(2,0,1)[None].astype(np.float32)
        s.fe=S('live_portrait_feature_extractor'); s.me=S('live_portrait_motion_extractor')
        s.eye=S('live_portrait_eye_retargeter'); s.st=S('live_portrait_stitcher'); s.gen=S('live_portrait_generator')
        s.feat=s.fe.run(None,{'input':x})[0]
        s.p,s.y,s.r,s.sc,s.t,s.ex,s.mp=s.me.run(None,{'input':x})
        s.p,s.y,s.r=[float(np.ravel(v)[0]) for v in (s.p,s.y,s.r)]
        print('pose', s.p, s.y, s.r, 'scale', np.ravel(s.sc)[:1], s.mp.shape, s.ex.shape)
        s.tgt=s.sc*(s.mp@rot(s.p,s.y,s.r).T+s.ex)+s.t
        s.lr=ratio(lm68,37,40,39,36); s.rr=ratio(lm68,43,46,45,42)
    def frame(s, dpitch=0, dyaw=0, droll=0, eye=0.0):
        src=s.mp@rot(s.p+dpitch, s.y+dyaw, s.r+droll).T
        src=(src+s.ex)*s.sc+s.t
        if eye!=0:
            v=np.concatenate([s.tgt.ravel(),[s.lr,s.rr,0.0 if eye<0 else 0.6]]).reshape(1,-1).astype(np.float32)
            src=src+(s.eye.run(None,{'input':v})[0]*abs(eye)).reshape(-1,21,3)
        src=s.st.run(None,{'source':src.astype(np.float32),'target':s.tgt.astype(np.float32)})[0]
        out=s.gen.run(None,{'feature_volume':s.feat,'source':src,'target':s.tgt.astype(np.float32)})[0][0]
        out=(out.transpose(1,2,0).clip(0,1)*255).astype(np.uint8)[:,:,::-1]
        return s.paste(out)
    def paste(s, crop):
        H,W=s.img.shape[:2]
        inv=cv2.invertAffineTransform(s.A)
        pts=tp(np.array([[0,0],[512,0],[512,512],[0,512]],float),inv)
        x1,y1=np.clip(np.floor(pts.min(0)).astype(int),0,[W,H]); x2,y2=np.clip(np.ceil(pts.max(0)).astype(int),0,[W,H])
        pm=inv.copy(); pm[0,2]-=x1; pm[1,2]-=y1
        m=cv2.warpAffine(s.box,pm,(x2-x1,y2-y1)).clip(0,1)[...,None]
        f=cv2.warpAffine(crop,pm,(x2-x1,y2-y1),borderMode=cv2.BORDER_REPLICATE)
        o=s.img.copy(); reg=o[y1:y2,x1:x2]
        o[y1:y2,x1:x2]=(reg*(1-m)+f*m).astype(np.uint8)
        s.rect=(x1,y1,x2,y2); s.wmask=np.zeros((H,W),np.float32); s.wmask[y1:y2,x1:x2]=m[...,0]
        return o

# ---------- post-processing ----------
_gf=None
def gfpgan(img, lm68, blend=0.6):
    global _gf
    if _gf is None: _gf=S('gfpgan_1.4')
    l5=to5(lm68)
    A=cv2.estimateAffinePartial2D(l5, FFHQ*512, method=cv2.RANSAC, ransacReprojThreshold=100)[0]
    crop=cv2.warpAffine(img,A,(512,512),borderMode=cv2.BORDER_REPLICATE,flags=cv2.INTER_AREA)
    bm=np.ones((512,512),np.float32); b=int(512*0.5*0.3); ba=max(b//2,1)
    bm[:ba]=0; bm[-ba:]=0; bm[:,:ba]=0; bm[:,-ba:]=0; bm=cv2.GaussianBlur(bm,(0,0),b*0.25)
    x=((crop[:,:,::-1]/255.-0.5)/0.5).transpose(2,0,1)[None].astype(np.float32)
    o=_gf.run(None,{_gf.get_inputs()[0].name:x})[0][0]
    o=(((np.clip(o,-1,1)+1)/2).transpose(1,2,0)*255).round().astype(np.uint8)[:,:,::-1]
    H,W=img.shape[:2]; inv=cv2.invertAffineTransform(A)
    m=cv2.warpAffine(bm,inv,(W,H))[...,None]*blend
    f=cv2.warpAffine(o,inv,(W,H),borderMode=cv2.BORDER_REPLICATE)
    return (img*(1-m)+f*m).astype(np.uint8)

def head_mask(shape, lm):
    H,W=shape[:2]
    cx=(lm[0,0]+lm[16,0])/2; fw=lm[16,0]-lm[0,0]
    top=lm[19:25,1].min()-0.95*fw*0.62; bot=lm[8,1]+0.30*fw
    cy=(top+bot)/2; ay=(bot-top)/2; ax=fw*0.78
    m=np.zeros((H,W),np.float32)
    cv2.ellipse(m,(int(cx),int(cy)),(int(ax),int(ay)),0,0,360,1,-1)
    return cv2.GaussianBlur(m,(0,0),fw*0.07)

import os
# Folders: LP_WORK holds inputs/outputs (img/up.png, img/src.png, lm68.npy, out3/…), LP_MODELS the .onnx models.
WORK = os.environ.get('LP_WORK', 'work')
MODELS = os.environ.get('LP_MODELS', 'models')
import sys, os, json, time; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from lp import *
OUT=WORK+'/out3'; os.makedirs(OUT,exist_ok=True)
OUTW=1200
img=cv2.imread(WORK+'/img/up.png'); lm=np.load(WORK+'/lm68.npy')
H,W=img.shape[:2]
src=cv2.imread(WORK+'/img/src.png'); h,w=src.shape[:2]; s=W/w
seg=S('u2net_human_seg')
# circle (same as the original cutout)
hsv=cv2.cvtColor(src,cv2.COLOR_BGR2HSV); grey=(hsv[...,2]>140)&(hsv[...,1]<40)
ys,xs=np.nonzero(grey); r=(xs.max()-xs.min())/2; cx=(xs.min()+xs.max())/2; cy=ys.min()+r
yy,xx=np.mgrid[0:H,0:W]; circ=np.clip((r*s-6-np.sqrt((xx-cx*s)**2+(yy-cy*s)**2))/6,0,1)
k5=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5))
def alpha_of(frame):
    rgb=cv2.cvtColor(frame,cv2.COLOR_BGR2RGB).astype(np.float32)/255.
    x=cv2.resize(rgb,(320,320),interpolation=cv2.INTER_AREA)
    x=((x-[0.485,0.456,0.406])/[0.229,0.224,0.225]).transpose(2,0,1)[None].astype(np.float32)
    m=seg.run(None,{seg.get_inputs()[0].name:x})[0][0,0]; m=(m-m.min())/(m.max()-m.min()+1e-8)
    m=np.clip(cv2.resize(m,(W,H),interpolation=cv2.INTER_CUBIC),0,1)*circ
    m=np.clip((m-0.12)/0.8,0,1); m=cv2.erode(m,k5); return cv2.GaussianBlur(m,(0,0),1.2)
def decon(frame,a):
    up=frame.astype(np.float32); hard=(a>0.92).astype(np.float32)
    F=cv2.GaussianBlur(up*hard[...,None],(0,0),6)/(cv2.GaussianBlur(hard,(0,0),6)[...,None]+1e-4)
    t=np.clip((0.92-a)/0.6,0,1)[...,None]; return up*(1-t)+F*t

a0=alpha_of(img)
ys_,xs_=np.nonzero(a0>0.02); Y0=max(0,ys_.min()-40); X0=max(0,xs_.min()-10); X1=min(W,xs_.max()+10)
sc=OUTW/(X1-X0); OUTH=int(round((H-Y0)*sc))
def to_out(arr): return cv2.resize(arr[Y0:,X0:X1],(OUTW,OUTH),interpolation=cv2.INTER_AREA)

lp=LP(img,lm)
fw=lm[16,0]-lm[0,0]
def head_mask2():
    cxh=(lm[0,0]+lm[16,0])/2; top=lm[19:25,1].min()-0.62*fw; bot=lm[8,1]+0.32*fw
    m=np.zeros((H,W),np.float32)
    cv2.ellipse(m,(int(cxh),int((top+bot)/2)),(int(fw*0.86),int((bot-top)/2)),0,0,360,1,-1)
    return cv2.GaussianBlur(m,(0,0),fw*0.07)
hm=head_mask2()
hmo=to_out(hm); ys_,xs_=np.nonzero(hmo>0.003)
rx0=max(0,xs_.min()-2); ry0=max(0,ys_.min()-2); rx1=min(OUTW,xs_.max()+3); ry1=min(OUTH,ys_.max()+3)
bb=[lm[:,0].min()-60,lm[:,1].min()-120,lm[:,0].max()+60,lm[:,1].max()+40]

base_rgb=decon(img,a0)
YAWS=[round(-18+2.25*j,2) for j in range(17)]; PITCHES=[-7,-3.5,0,3.5,7]; EYES=[0,-1.0]
def sharpen(x,amt=0.55,sig=1.3):
    xf=x.astype(np.float32); bl=cv2.GaussianBlur(xf,(0,0),sig)
    return (np.clip(xf+amt*(xf-bl),0,255)*hm[...,None]+xf*(1-hm[...,None])).astype(np.uint8)
jobs=[(k,j,e) for k in range(5) for j in range(17) for e in range(2)]
jobs.sort(key=lambda q:(abs(q[0]-2)*3+abs(q[1]-8)/8+q[2]*0.1))
meta=dict(outW=OUTW,outH=OUTH,rect=[int(rx0),int(ry0),int(rx1-rx0),int(ry1-ry0)],yaws=YAWS,pitches=PITCHES,eyes=EYES)
json.dump(meta,open(f'{OUT}/meta.json','w'))
os.makedirs(f'{OUT}/png',exist_ok=True)
cv2.imwrite(f'{OUT}/base_rgb_alpha.png',to_out(np.dstack([base_rgb,a0*255]).clip(0,255).astype(np.uint8)))
t0=time.time(); made=0
for n,(k,j,e) in enumerate(jobs):
    fn=f'{OUT}/png/p{k}y{j}e{e}.png'
    if os.path.exists(fn): continue
    o=lp.frame(dpitch=PITCHES[k],dyaw=YAWS[j],eye=EYES[e])
    o=(o*hm[...,None]+img*(1-hm[...,None])).astype(np.uint8)
    l2=landmarks68(o,bb); o=sharpen(gfpgan(o,l2,0.85))
    a=alpha_of(o); rgb=decon(o,a)
    a=hm*a+(1-hm)*a0; rgb=hm[...,None]*rgb+(1-hm[...,None])*base_rgb
    rgba=np.dstack([rgb,a*255]).clip(0,255).astype(np.uint8)
    full=to_out(rgba)
    if (k,j,e)==(2,8,0): cv2.imwrite(f'{OUT}/neutral_full.png',full)
    cv2.imwrite(fn,full[ry0:ry1,rx0:rx1])
    made+=1; print(f'{made}/{len(jobs)} {fn[-14:]} {time.time()-t0:.0f}s',flush=True)
print('DONE',flush=True)

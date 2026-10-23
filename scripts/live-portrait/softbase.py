import os
# Folders: LP_WORK holds inputs/outputs (img/up.png, img/src.png, lm68.npy, out3/…), LP_MODELS the .onnx models.
WORK = os.environ.get('LP_WORK', 'work')
MODELS = os.environ.get('LP_MODELS', 'models')
# Rebuild base.png with a soft, head-shaped hole (instead of a hard rectangle) so the head layer
# always lands on solid body pixels at its edges.
import sys, json; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import cv2, numpy as np, onnxruntime as ort
img=cv2.imread(WORK+'/img/up.png'); lm=np.load(WORK+'/lm68.npy'); H,W=img.shape[:2]
src=cv2.imread(WORK+'/img/src.png'); h,w=src.shape[:2]; s=W/w
seg=ort.InferenceSession(MODELS+'/u2net_human_seg.onnx')
hsv=cv2.cvtColor(src,cv2.COLOR_BGR2HSV); grey=(hsv[...,2]>140)&(hsv[...,1]<40)
ys,xs=np.nonzero(grey); r=(xs.max()-xs.min())/2; cx=(xs.min()+xs.max())/2; cy=ys.min()+r
yy,xx=np.mgrid[0:H,0:W]; circ=np.clip((r*s-6-np.sqrt((xx-cx*s)**2+(yy-cy*s)**2))/6,0,1)
rgb=cv2.cvtColor(img,cv2.COLOR_BGR2RGB).astype(np.float32)/255.
x=cv2.resize(rgb,(320,320),interpolation=cv2.INTER_AREA)
x=((x-[0.485,0.456,0.406])/[0.229,0.224,0.225]).transpose(2,0,1)[None].astype(np.float32)
m=seg.run(None,{seg.get_inputs()[0].name:x})[0][0,0]; m=(m-m.min())/(m.max()-m.min()+1e-8)
m=np.clip(cv2.resize(m,(W,H),interpolation=cv2.INTER_CUBIC),0,1)*circ
m=np.clip((m-0.12)/0.8,0,1); m=cv2.erode(m,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5))); a0=cv2.GaussianBlur(m,(0,0),1.2)
ys_,xs_=np.nonzero(a0>0.02); Y0=max(0,ys_.min()-40); X0=max(0,xs_.min()-10); X1=min(W,xs_.max()+10)
meta=json.load(open(WORK+'/out3/meta.json')); OUTW,OUTH=meta['outW'],meta['outH']
to_out=lambda arr: cv2.resize(arr[Y0:,X0:X1],(OUTW,OUTH),interpolation=cv2.INTER_AREA)
fw=lm[16,0]-lm[0,0]; cxh=(lm[0,0]+lm[16,0])/2; top=lm[19:25,1].min()-0.62*fw; bot=lm[8,1]+0.32*fw
hm=np.zeros((H,W),np.float32); cv2.ellipse(hm,(int(cxh),int((top+bot)/2)),(int(fw*0.86),int((bot-top)/2)),0,0,360,1,-1); hm=cv2.GaussianBlur(hm,(0,0),fw*0.07)
hmo=to_out(hm)
base=cv2.imread(WORK+'/out3/base_rgb_alpha.png',cv2.IMREAD_UNCHANGED)
assert base.shape[:2]==(OUTH,OUTW), (base.shape, OUTH, OUTW)
# sanity: the rect from meta must contain every pixel the hole touches
rx,ry,rw,rh=meta['rect']; hole=np.clip(hmo*3,0,1)
outside=hole.copy(); outside[ry:ry+rh,rx:rx+rw]=0
print('hole outside rect (max):', float(outside.max()))
base[...,3]=(base[...,3].astype(np.float32)*(1-hole)).round().astype(np.uint8)
cv2.imwrite(WORK+'/base_soft.png',base)
v=base.copy().astype(np.float32); bg=np.zeros_like(v[...,:3]); bg[:]=(40,10,60); al=v[...,3:4]/255
cv2.imwrite(WORK+'/base_soft_check.jpg',cv2.resize((v[...,:3]*al+bg*(1-al)).astype(np.uint8),(600,670)))

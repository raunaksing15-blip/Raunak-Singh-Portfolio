from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image, ImageDraw
from _profile import PROFILE as P, HERE, ASSETS
G="/usr/share/fonts/truetype/google-fonts/"; L="/usr/share/fonts/truetype/liberation/"
for n,f in [("PB",G+"Poppins-Bold.ttf"),("PM",G+"Poppins-Medium.ttf"),("R",L+"LiberationSans-Regular.ttf"),("B",L+"LiberationSans-Bold.ttf"),("I",L+"LiberationSans-Italic.ttf")]:
    pdfmetrics.registerFont(TTFont(n,f))
pdfmetrics.registerFontFamily("R",normal="R",bold="B",italic="I",boldItalic="B")
NAVY=colors.HexColor("#0B1630"); BLUE=colors.HexColor("#2F6BFF"); INK=colors.HexColor("#1B2333"); MUTED=colors.HexColor("#5B6475"); LINE=colors.HexColor("#D9DEE8")
W,H=A4; BAND=44*mm; M=16*mm
# circular photo
im=Image.open(HERE/"photo-000.jpg").convert("RGB").resize((600,600))
mask=Image.new("L",(600,600),0); ImageDraw.Draw(mask).ellipse((0,0,599,599),fill=255)
im.putalpha(mask); im.save(HERE/"photo_round.png")
def page(c,doc):
    c.saveState(); c.setFillColor(NAVY); c.rect(0,H-BAND,W,BAND,stroke=0,fill=1)
    c.setFillColor(BLUE); c.rect(0,H-BAND-1.2*mm,W,1.2*mm,stroke=0,fill=1)
    d=26*mm; c.drawImage(ImageReader(str(HERE/"photo_round.png")),W-M-d,H-BAND+(BAND-d)/2,d,d,mask="auto")
    c.setFillColor(colors.white); c.setFont("PB",25); c.drawString(M,H-17*mm,P["name"])
    c.setFillColor(colors.HexColor("#9DB8FF")); c.setFont("PM",10.5); c.drawString(M,H-24*mm,P["title"])
    items=[("Email","mailto:"+P["email"],P["email"]),("GitHub",P["github"],"github.com/raunaksing15-blip"),
           ("LinkedIn",P["linkedin"],"linkedin.com/in/raunak-singh-923298387"),("X",P["x"],"x.com/raunaksingh")]
    c.setFont("R",8.6); y1=H-32*mm; x=M
    for i,(k,u,t) in enumerate(items):
        y=y1 if i<2 else y1-4.6*mm
        if i==2: x=M
        c.setFillColor(colors.HexColor("#9DB8FF")); c.setFont("B",8.6); c.drawString(x,y,k); kw=c.stringWidth(k+"  ","B",8.6)
        c.setFillColor(colors.white); c.setFont("R",8.6); c.drawString(x+kw,y,t); tw=c.stringWidth(t,"R",8.6)
        c.linkURL(u,(x,y-2,x+kw+tw,y+9),relative=0)
        x+=kw+tw+9*mm
    c.restoreState()
fr=Frame(M,11*mm,W-2*M,H-BAND-1.2*mm-11*mm-6*mm,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)
doc=BaseDocTemplate(str(ASSETS/"Raunak_Singh_Resume.pdf"),pagesize=A4,title="Raunak Singh - Resume",author="Raunak Singh")
doc.addPageTemplates([PageTemplate(frames=[fr],onPage=page)])
body=ParagraphStyle("b",fontName="R",fontSize=9.4,leading=12.6,textColor=INK)
mut=ParagraphStyle("m",parent=body,textColor=MUTED,fontSize=8.8)
sec=ParagraphStyle("s",fontName="PB",fontSize=9.4,leading=12,textColor=BLUE,spaceBefore=9,spaceAfter=2)
pname=ParagraphStyle("pn",parent=body,fontName="B",fontSize=10.6,leading=13.5,textColor=NAVY)
bul=ParagraphStyle("bu",parent=body,leftIndent=10,bulletIndent=1,spaceAfter=1.4)
def lk(u,t): return f'<a href="{u}" color="#2F6BFF">{t}</a>'
def section(t):
    return [Paragraph(t.upper(),sec),Table([[""]],colWidths=[W-2*M],rowHeights=[0.5],style=TableStyle([("LINEABOVE",(0,0),(-1,0),0.6,LINE)])),Spacer(1,3)]
def head(left,right):
    t=Table([[Paragraph(left,pname),Paragraph(right,ParagraphStyle("r",parent=mut,alignment=2))]],colWidths=[(W-2*M)*0.74,(W-2*M)*0.26])
    t.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"BOTTOM"),("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0),("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),0)])); return t
s=[]
s+=section("Summary"); s.append(Paragraph(P["summary"],body))
e=P["education"]; s+=section("Education"); s.append(head(e["school"],e["dates"]))
s.append(Paragraph(f"{e['degree']}  |  {e['note']}",mut))
s+=section("Projects")
for p in P["projects"]:
    blk=[head(p["name"]+f' <font name="R" size="9" color="#5B6475">- {p["tag"]}</font>',p["dates"]),
         Paragraph("  |  ".join(lk(u,t) for t,u in p["links"]),ParagraphStyle("lk",parent=mut,spaceAfter=2))]
    blk+=[Paragraph(b,bul,bulletText="•") for b in p["bullets"]]; blk.append(Spacer(1,4)); s.append(KeepTogether(blk))
s+=section("Leadership Experience")
for l in P["leadership"]:
    s.append(head(f'{l["role"]}, {l["name"]} <font name="R" size="9" color="#5B6475">- {l["place"]}</font>',l["dates"]))
    s+= [Paragraph(b,bul,bulletText="•") for b in l["bullets"]]
s+=section("Technical Skills")
rows=[[Paragraph(k,ParagraphStyle("k",parent=body,fontName="B",textColor=NAVY)),Paragraph(v,body)] for k,v in P["skills"]]
t=Table(rows,colWidths=[28*mm,W-2*M-28*mm]); t.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),0),("TOPPADDING",(0,0),(-1,-1),1),("BOTTOMPADDING",(0,0),(-1,-1),1)])); s.append(t)
s+=section("Open Source and Interests"); s.append(Paragraph(P["interests"],body))
doc.build(s)

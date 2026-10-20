from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem, HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from _profile import PROFILE as P, HERE, ASSETS
L="/usr/share/fonts/truetype/liberation/"
pdfmetrics.registerFont(TTFont("R",L+"LiberationSans-Regular.ttf"))
pdfmetrics.registerFont(TTFont("B",L+"LiberationSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("I",L+"LiberationSans-Italic.ttf"))
pdfmetrics.registerFontFamily("R",normal="R",bold="B",italic="I",boldItalic="B")
base=ParagraphStyle("b",fontName="R",fontSize=9.8,leading=13,textColor=colors.black)
h1=ParagraphStyle("h1",parent=base,fontName="B",fontSize=19,leading=23)
h2=ParagraphStyle("h2",parent=base,fontName="B",fontSize=10.5,leading=14,spaceBefore=9,spaceAfter=1)
sub=ParagraphStyle("s",parent=base,textColor=colors.HexColor("#222222"))
def link(u,t=None): return f'<a href="{u}" color="#1a4fb4">{t or u}</a>'
def build(out):
    d=SimpleDocTemplate(out,pagesize=A4,leftMargin=17*mm,rightMargin=17*mm,topMargin=14*mm,bottomMargin=13*mm,
        title="Raunak Singh - Resume",author="Raunak Singh")
    s=[Paragraph(P["name"],h1),Paragraph(P["title"],sub),
       Paragraph(" | ".join([link("mailto:"+P["email"],P["email"]),link(P["github"],"github.com/raunaksing15-blip"),
         link(P["linkedin"],"linkedin.com/in/raunak-singh-923298387"),link(P["x"],"x.com/raunaksingh")]),base)]
    def H(t):
        s.append(Paragraph(t.upper(),h2)); s.append(HRFlowable(width="100%",thickness=0.6,color=colors.black,spaceAfter=3))
    def bl(items): 
        return ListFlowable([ListItem(Paragraph(b,base),leftIndent=11,bulletColor=colors.black) for b in items],
            bulletType="bullet",start="•",leftIndent=11,bulletFontSize=8)
    H("Summary"); s.append(Paragraph(P["summary"],base))
    e=P["education"]; H("Education")
    s.append(Paragraph(f"<b>{e['school']}</b> - {e['dates']}",base))
    s.append(Paragraph(f"{e['degree']}. {e['note']}",base))
    H("Projects")
    for p in P["projects"]:
        s.append(Paragraph(f"<b>{p['name']}</b> - {p['tag']} | {p['dates']}",base))
        s.append(Paragraph("  |  ".join(link(u,t) for t,u in p["links"]),base))
        s.append(bl(p["bullets"])); s.append(Spacer(1,3))
    H("Leadership Experience")
    for l in P["leadership"]:
        s.append(Paragraph(f"<b>{l['role']}</b>, {l['name']} ({l['place']}) | {l['dates']}",base)); s.append(bl(l["bullets"]))
    H("Technical Skills")
    for k,v in P["skills"]: s.append(Paragraph(f"<b>{k}:</b> {v}",base))
    H("Open Source and Interests"); s.append(Paragraph(P["interests"],base))
    d.build(s)
if __name__=="__main__": build(str(ASSETS/"Raunak_Singh_Resume_ATS.pdf"))

import sys
from pypdf import PdfReader

reader = PdfReader('../TASKFLOW_Analysis_Report.pdf')
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"
with open('report.txt', 'w', encoding='utf-8') as f:
    f.write(text)

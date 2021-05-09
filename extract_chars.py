import os
import re

def preprocess(name):
    return re.sub('[ًٌٍَُِّْ]','', name)
map_chars = {
    "\u0623":["\u0621", "\u0627"], # أ
    "\u0622":["\u0605", "\u0627"], # آ
    "\u0625":["\u0627", "\u0621"], # إ
    "\u0628":["\u066E", "\u065C"], # ب
    "\u062A":["\u065C", "\u065C", "\u066E"], # ت
    "\u062B":["\u065C", "\u065C", "\u065C", "\u066E"], # ث 
    "\u062C":["\u062D", "\u065C"], # ج
    "\u062E":["\u065C", "\u062D"], # خ
    "\u0630":["\u062F", "\u065C"], # ذ
    "\u0632":["\u065C", "\u0631"], # ز
    "\u0634":["\u065C", "\u065C", "\u065C", "\u0633"], # ش
    "\u0636":["\u065C", "\u0635"], # ض
    "\u0638":["\u065C", "\u0637"], # ظ
    "\u063A":["\u065C", "\u0639"], # غ
    "\u0641":["\u065C", "\u066F"], # ف
    "\u0642":["\u065C", "\u065C", "\u066F"], # ق
    "\u06A4":["\u065C", "\u065C", "\u065C", "\u066F"], # ڤ
    "\u0643":["\u0621", "\u0644"], # ك
    "\u0646":["\u065C", "\u06BA"], # ن
    "\u0624":["\u0621", "\u0648"], # ؤ
    "\u064A":["\u0649", "\u065C", "\u065C"], #ي
    "\u0626":["\u0621", "\u0649"], #ئ
    "\u0629":["\u065C", "\u065C", "\u0647"], #ه
}
image_dir = 'khatt_server/server/static/images/'
names = ''
for image_name in os.listdir(image_dir):

    name =(image_name.split("_")[1]).split('.')[0]
    for char in name.lower():
        if char in 'abcdefghijklmnopqrstuvwxyz' :
            print(image_name)
            break
    names += preprocess(name)

for char in set(names):
    if char in map_chars:
        print(char , '->', map_chars[char])
    else:
        print(char)

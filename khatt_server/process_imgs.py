import os 
import shutil 

ctr = 0 

def validate_file_contents(file1, file2):
    with open(file1, 'rb') as f1, open(file2, 'rb') as f2:
        contents1 = f1.read()
        contents2 = f2.read()
    return contents1 == contents2 

# how_many = 0 
# duplicates = []
# print('there are ', len(os.listdir('zaid-clean-2200')))
# for file1 in os.listdir('zaid-clean-2200'):
#     for file2 in os.listdir('zaid-clean-2200'):
#         if file1 == file2:
#             continue
#         else:
#             if validate_file_contents(f'zaid-clean-2200/{file1}', f'zaid-clean-2200/{file2}'):
#                 duplicates.append(file2)
#                 how_many += 1

# for file in duplicates:
#     os.remove(f'zaid-clean-2200/{file}')

print('there are ', len(os.listdir('zaid-clean-2200')))

for file in os.listdir('zaid-clean-2200'):
    ext = file.split('.')[-1]
    shutil.copyfile(f'zaid-clean-2200/{file}', f'server/static/larger_images/{ctr}.{ext}')
    ctr += 1
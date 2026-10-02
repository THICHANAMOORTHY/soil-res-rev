with open('downloads/test_farm_101.pdf', 'rb') as f:
    c101 = f.read().decode('latin1', errors='ignore')

idx = 0
while True:
    idx = c101.find('Save', idx)
    if idx == -1:
        break
    print(c101[max(0, idx - 40):idx + 80])
    idx += 4

idx = 0
while True:
    idx = c101.find('saves', idx)
    if idx == -1:
        break
    print(c101[max(0, idx - 40):idx + 80])
    idx += 5

import random

def next_predict_draw(data, columns):
    pred = []


    # take 1 from last hits
    lastHits = getLastHitNumbers(data)
    
    index = int(random.random() * len(lastHits))
    pred.append(lastHits[index]['Value'])
    
    # select 3 groups based on totalHits
    flip_coin = random.random() * 2

    arr = getTotalHitsNumbers(data) if flip_coin >= 1 else getDistanceNumbers(data)
    
    low = arr[0]
    middle = arr[1]
    high = arr[2]
    
    # take 1 from low
    index = int(random.random() * len(low))
    pred.append(low[index]['Value'])
    
    # take 2 from middle
    index = int(random.random() * len(middle))
    pred.append(middle[index]['Value'])
    
    index = int(random.random() * len(middle))
    pred.append(middle[index]['Value'])
    
    if flip_coin < 1:
        # add two more
        index = int(random.random() * len(middle))
        pred.append(middle[index]['Value'])
        
        index = int(random.random() * len(middle))
        pred.append(middle[index]['Value'])
    
    pred = list(set(pred)) # remove duplicates from pred
    
    if len(pred) < 4:
        index = int(random.random() * len(middle))
        pred.append(middle[index]['Value'])
    
    # take 3 from high
    index = int(random.random() * len(high))
    pred.append(high[index]['Value'])
    
    if flip_coin >= 1:
        index = int(random.random() * len(high))
        pred.append(high[index]['Value'])
    
        index = int(random.random() * len(high))
        pred.append(high[index]['Value'])
    
    pred = list(set(pred)) # remove duplicates from pred
    while len(pred) < columns:
        index = int(random.random() * len(high))
        pred.append(high[index]['Value'])
        pred = list(set(pred))
        
    pred.sort()
    
    print(f'pred = {pred}')
    return pred

    
def getLastHitNumbers(numbers):
    arr = [x for x in numbers if x['IsHit'] == True]
    arr = sorted(arr, key=lambda x: x["Value"], reverse=False)
    return arr
    
def getTotalHitsNumbers(numbers):
    low = []
    middle = []
    high = []
    arr = sorted(numbers, key=lambda x: x["TotalHits"], reverse=False)

    one_third = int(len(arr) / 3 + 1)
    two_third = int((len(arr) * 2) / 3 + 1)
    for i in range(len(arr)):
        if (i < one_third):
            low.append(arr[i])
        elif (i < two_third):
            middle.append(arr[i])
        else:
            high.append(arr[i])
    array = []
    array.append(low)
    array.append(middle)
    array.append(high)
    
    return array

def getDistanceNumbers(numbers):
    
    arr = sorted(numbers, key=lambda x: x["Distance"], reverse=False)
    low = []
    middle = []
    high = []
    one_third = int(len(arr) / 3 + 1)
    two_third = int((len(arr) * 2) / 3 + 1)
    
    for i in range(len(arr)):
        if(arr[i]['Distance'] == 0): 
            continue
        
        if (i < one_third):
            low.append(arr[i])
        elif (i < two_third):
            middle.append(arr[i])
        else:
            high.append(arr[i])
    array = []
    array.append(low)
    array.append(middle)
    array.append(high)
    
    return array
    

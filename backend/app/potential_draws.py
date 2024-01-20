import random


class PotentialDraws:
    FREQUENT_GAP = 4
    PAST_DRAWS = 8
    TWO_HOTS_1_COLD = 25
    TWO_HOTS_GAP = 5
    COLD_DISTANCE = 15
    PREVIOUS_DISTANCE = 6

    TWO_COLD_COLD_DISTANCE = 10
    MAX_ALLOWED_ROWS = 50

    def __init__(self, data, columns, rows):
        self.data = data
        self.numbers = data[0]["Numbers"]
        self.columns = columns
        self.rows = rows
        

    def next_potential_draws(self):
        
        results = [[]]
        for n in range(self.rows):            
            flip_coin = random.random() * 2
            if flip_coin >= 1:
                results.append(self.next_potential_draws_1())
            else:
                results.append(self.next_potential_draws_2())
                
        print(f"results = {results}")        
        return results
    
    def next_potential_draws_1(self):
        pred = []

        # take 1 from last hits
        lastHits = self.getLastHitNumbers()
        index = random.randint(0, len(lastHits) - 1)
        pred.append(lastHits[index]["Value"])

        # select 3 groups based on totalHits
        flip_coin = random.random() * 2

        arr = (
            self.getTotalHitsNumbers() if flip_coin >= 1 else self.getDistanceNumbers()
        )

        low = arr[0]
        middle = arr[1]
        high = arr[2]

        # take 1 from low
        index = random.randint(0, len(low) - 1)
        pred.append(low[index]["Value"])

        # take 1 from middle
        index = random.randint(0, len(middle) - 1)
        pred.append(middle[index]["Value"])       

        if flip_coin < 1:
            # add 2 from DistanceNumbers
            index = random.randint(0, len(low) - 1)
            pred.append(low[index]["Value"])
            index = random.randint(0, len(high) - 1)
            pred.append(high[index]["Value"])
        else:
            # take 2 from TotalHitsNumbers
            index = random.randint(0, len(high) - 1)
            pred.append(high[index]["Value"])       
            index = random.randint(0, len(middle) - 1)
            pred.append(middle[index]["Value"])      

        pred = list(set(pred))  # remove duplicates from pred

        # take 1 from FrequentNumbers
        frequent = self.getFrequentNumbers()
        if len(frequent) > 0:
            index = random.randint(0, len(frequent) - 1)
            pred.append(frequent[index]["Value"])

        # take 1 from Two_Hots_1_Cold_Numbers
        two_hots_1_cold = self.get_Two_Hots_1_Cold_Numbers()      
        if two_hots_1_cold != []:
            index = random.randint(0, len(two_hots_1_cold) - 1)
            pred.append(two_hots_1_cold[index]["Value"])
        else:
            two_cold_numbers = self.get_Two_Cold_Numbers()
            if two_cold_numbers != []:
                index = random.randint(0, len(two_cold_numbers) - 1)
                pred.append(two_cold_numbers[index]["Value"])

        pred = list(set(pred))  # remove duplicates from pred
        while len(pred) < self.columns:
            if len(two_hots_1_cold) > 1:
                index = random.randint(0, len(two_hots_1_cold) - 1)
                pred.append(two_hots_1_cold[index]["Value"])
            else:
                index = random.randint(0, len(frequent) - 1)
                pred.append(frequent[index]["Value"])
                
            pred = list(set(pred))

        """
        # print out
        print(f"frequent = {frequent}")
        print(f"two_hots_1_cold = {two_hots_1_cold}")
        print(f"two_cold = {two_cold}")
        """
        pred.sort()
        return pred

    def next_potential_draws_2(self):
        pred = []

        # take 1 from last hits
        lastHits = self.getLastHitNumbers()
        index = random.randint(0, len(lastHits) - 1)
        pred.append(lastHits[index]["Value"])


        # frequent numbers
        frequent = self.getFrequentNumbers()

        # take 3 from frequent
        if len(frequent) > 3:
            index = random.randint(0, len(frequent) - 1)
            pred.append(frequent[index]["Value"])

            index = random.randint(0, len(frequent) - 1)
            pred.append(frequent[index]["Value"])

            index = random.randint(0, len(frequent) - 1)
            pred.append(frequent[index]["Value"])

        # take 1 from two_hots_1_cold
        two_hots_1_cold = self.get_Two_Hots_1_Cold_Numbers()
        if len(two_hots_1_cold) > 0:
            index = random.randint(0, len(two_hots_1_cold) - 1)
            pred.append(two_hots_1_cold[index]["Value"])
        else:
            lastHits = self.getLastHitNumbers()
            index = random.randint(0, len(lastHits) - 1)
            pred.append(lastHits[index]["Value"])

        # take 1 from two_cold
        two_cold = self.get_Two_Cold_Numbers()
        if len(two_cold) > 0:
            index = random.randint(0, len(two_cold) - 1)
            pred.append(two_cold[index]["Value"])
        else:
            lastHits = self.getLastHitNumbers()
            index = random.randint(0, len(lastHits) - 1)
            pred.append(lastHits[index]["Value"])

        pred = list(set(pred))
        while len(pred) < self.columns:
            flip_coin = random.random() * 2
            arr = (
                self.getTotalHitsNumbers()
                if flip_coin >= 1
                else self.getDistanceNumbers()
            )

            low = arr[0]
            middle = arr[1]
            high = arr[2]

            # take 1 from DistanceNumbers or totalHitsNumbers
            index = random.randint(0, 2)
            sub_index = random.randint(0, len(arr[index]) - 1)
            pred.append(arr[index][sub_index]["Value"])
            pred = list(set(pred))

        """
        # print out
        print(f"frequent = {frequent}")
        print(f"two_hots_1_cold = {two_hots_1_cold}")
        print(f"two_cold = {two_cold}")
        """
        pred.sort()
        return pred

    def getLastHitNumbers(self):
        arr = [x for x in self.numbers if x["IsHit"] == True]
        arr = sorted(arr, key=lambda x: x["Value"], reverse=False)

        ones = []
        tens = []
        twenties = []
        thirties = []
        forties = []

        ones.append([x for x in arr if x["Value"] < 10])
        tens.append([x for x in arr if 10 <= x["Value"] < 20])
        twenties.append([x for x in arr if 20 <= x["Value"] < 30])
        thirties.append([x for x in arr if 30 <= x["Value"] < 40])
        forties.append([x for x in arr if 40 <= x["Value"]])

        arrays = [ones, tens, twenties, thirties, forties]
        removed_empty_arrays = [sublist for sublist in arrays if any(sublist)]
        # index = random.randint(0, len(arrays) - 1)
        longest_array = max(removed_empty_arrays, key=len)

        return longest_array[0]

    def getTotalHitsNumbers(self):
        low = []
        middle = []
        high = []
        arr = sorted(self.numbers, key=lambda x: x["TotalHits"], reverse=False)

        one_third = int(len(arr) / 3 + 1)
        two_third = int((len(arr) * 2) / 3 + 1)
        for i in range(len(arr)):
            if i < one_third:
                low.append(arr[i])
            elif i < two_third:
                middle.append(arr[i])
            else:
                high.append(arr[i])
        array = []
        array.append(low)
        array.append(middle)
        array.append(high)

        return array

    def getDistanceNumbers(self):
        arr = sorted(self.numbers, key=lambda x: x["Distance"], reverse=False)
        low = []
        middle = []
        high = []
        one_third = int(len(arr) / 3 + 1)
        two_third = int((len(arr) * 2) / 3 + 1)

        for i in range(len(arr)):
            if arr[i]["Distance"] == 0:
                continue

            if i < one_third:
                low.append(arr[i])
            elif i < two_third:
                middle.append(arr[i])
            else:
                high.append(arr[i])
        array = []
        array.append(low)
        array.append(middle)
        array.append(high)

        return array

    # new algorithm

    def getFrequentNumbers(self):
        frequent = []
        numbers = self.data[0]["Numbers"]
        # in the past 7 - 8 draws this number has hit 3 times at least
        for n in numbers:
            # find n's last hit, if it < 3 pick it
            if self.getNumberPastHits(n):
                frequent.append(n)

        return frequent

    def getNumberPastHits(self, number):
        data = self.data
        draw_count = 0
        current_draw = data[0]
        for da in data:
            draw_count += 1
            numbers = da["Numbers"]
            num = [x for x in numbers if x["Value"] == number["Value"]][0]

            if num["IsHit"] == True and da["DrawNumber"] == current_draw["DrawNumber"]:
                return False
            elif num["Distance"] > self.FREQUENT_GAP and num["IsHit"] == False:
                return False
            elif draw_count == self.PAST_DRAWS:
                return True

    def get_Two_Hots_1_Cold_Numbers(self):
        two_hots_1_cold = []
        numbers = self.data[0]["Numbers"]
        for n in numbers:
            # testing only
            # if n['Value'] != 11:
            #    continue
            # end testing

            if self.get_2_Hots_1_Cold(n):
                two_hots_1_cold.append(n)

        return two_hots_1_cold

    def get_2_Hots_1_Cold(self, number):
        data = self.data
        draw_count = 0
        prev_distance = 0
        current_draw = data[0]
        number_of_hits = 0
        for da in data:
            draw_count += 1
            numbers = da["Numbers"]

            num = [x for x in numbers if x["Value"] == number["Value"]][0]
            if num["IsHit"] == True and da["DrawNumber"] == current_draw["DrawNumber"]:
                return False
            # elif num["Distance"] >= self.COLD_DISTANCE and draw_count < self.PAST_DRAWS:
            #    return False
            elif (
                num["Distance"] >= self.COLD_DISTANCE
                and prev_distance <= self.PREVIOUS_DISTANCE
                and self.COLD_DISTANCE <= draw_count < self.TWO_HOTS_1_COLD
                and 2 <= number_of_hits < 5
            ):
                return True
            elif num["Distance"] < self.COLD_DISTANCE and (
                prev_distance >= self.PREVIOUS_DISTANCE
                or draw_count > self.TWO_HOTS_1_COLD
            ):
                return False

            if num["IsHit"] == True:
                number_of_hits += 1
                prev_distance = 0
            else:
                prev_distance += 1

    def get_Two_Cold_Numbers(self):
        two_cold = []
        numbers = self.data[0]["Numbers"]
        for n in numbers:
            # testing only
            # if n['Value'] != 1:
            #    continue
            # end testing

            if self.get_Two_Cold(n):
                two_cold.append(n)

        return two_cold

    def get_Two_Cold(self, number):
        data = self.data
        draw_count = 0
        prev_distance = 0
        current_draw = data[0]
        number_of_hits = 0
        for da in data:
            draw_count += 1
            numbers = da["Numbers"]
            num = [x for x in numbers if x["Value"] == number["Value"]][0]

            if num["IsHit"] == True and da["DrawNumber"] == current_draw["DrawNumber"]:
                return False
            elif (
                num["IsHit"] == True
                and num["NumberOfDrawsWhenHit"] < self.TWO_COLD_COLD_DISTANCE
            ):
                return False

            elif (
                num["IsHit"] == True
                and num["NumberOfDrawsWhenHit"] >= self.TWO_COLD_COLD_DISTANCE
                and number_of_hits == 0
            ):
                number_of_hits += 1

            elif (
                num["IsHit"] == True
                and num["NumberOfDrawsWhenHit"] >= self.TWO_COLD_COLD_DISTANCE
                and number_of_hits == 1
            ):
                return True
            elif draw_count > self.MAX_ALLOWED_ROWS:
                return False

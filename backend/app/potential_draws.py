import random
import logging


class PotentialDraws:
    FREQUENT_GAP = 5
    PAST_DRAWS = 8
    HOTS_COLD = 25
    TWO_HOTS_GAP = 5
    COLD_DISTANCE = 15
    FREQUENT_HITS = 3
    LESS_FREQUENT_HITS = 7
    PREVIOUS_DISTANCE = 6

    TWO_COLD_COLD_DISTANCE = 10
    MAX_ALLOWED_ROWS = 50
    HITS_MIN_DISTANCE = 1

    def __init__(self, data, columns, rows):
        self.data = data
        self.numbers = data[0]["Numbers"]
        self.prev_draw_numbers = data[1]["Numbers"]
        self.columns = columns
        self.rows = rows
        self.remaining = []
        self.hitting = []
        
        logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s %(levelname)s: %(message)s',
        handlers=[
            logging.FileHandler('app.log'),  # Save logs to a file
            logging.StreamHandler()  # Also output to console (optional)
        ]
    )
        
    # new logic
    def is_a_potential_number(self, number):
        
        data = self.data
        current_draw = data[0]
        first_hit = False
        second_hit = False
        third_hit = False
        
        for draw_count, da in enumerate(data, start=1):
            numbers = da["Numbers"]
            num = [x for x in numbers if x["Value"] == number["Value"]][0]
            if num["IsHit"] and da["DrawNumber"] == current_draw["DrawNumber"]:
                return False                
            
            #1. last two hits are connected and the distance is less than 7 and greater than 3
            if (num["IsHit"]  
                and num["NumberOfDrawsWhenHit"] == 1  
                and self.FREQUENT_HITS < number["Distance"] < self.LESS_FREQUENT_HITS):
                return True
                
            # 2. in last hit the NumberOfDrawsWhenHit < 5 and the hit prior to last hit, 
            # the NumberOfDrawsWhenHit > 15 and current distance is around 5.
            if (num["IsHit"]  
                and first_hit == False):
                first_hit = True     
                continue                        
            if (num["IsHit"]  
                and num["NumberOfDrawsWhenHit"] > self.COLD_DISTANCE  
                and first_hit 
                and self.FREQUENT_HITS < number["Distance"] < self.LESS_FREQUENT_HITS):
                return True
                
            # 3. the last 3 hits their  1 < NumberOfDrawsWhenHit < 5 
            # and current distance is also < 5  
            if (num["IsHit"]  
                and self.FREQUENT_HITS < num["NumberOfDrawsWhenHit"] < self.TWO_HOTS_GAP  
                and first_hit
                and second_hit == False):
                    second_hit = True
                    continue
            if (num["IsHit"]  
                and self.FREQUENT_HITS < num["NumberOfDrawsWhenHit"] < self.TWO_HOTS_GAP  
                and first_hit
                and second_hit
                and not third_hit
                and self.FREQUENT_HITS < number["Distance"] < self.LESS_FREQUENT_HITS):
                    return True            
            
            # 4. in last hit the NumberOfDrawsWhenHit > 15 and current distance > 15
            if (num["IsHit"]  
                and num["NumberOfDrawsWhenHit"] > self.COLD_DISTANCE
                and number["Distance"] > self.COLD_DISTANCE):
                return True
                
            # 5. in last 2 hits, NumberOfDrawsWhenHit values are close and current 
            # distance close to this NumberOfDrawsWhenHit value
            if (num["IsHit"]  
                and self.FREQUENT_HITS < num["NumberOfDrawsWhenHit"] < self.TWO_HOTS_GAP   
                and first_hit 
                and self.FREQUENT_HITS < number["Distance"] < self.TWO_HOTS_GAP):
                return True
            # 6. in last hit the NumberOfDrawsWhenHit > 15 and current distance > 5
            if (num["IsHit"]  
                and num["NumberOfDrawsWhenHit"] > self.COLD_DISTANCE
                and number["Distance"] > self.FREQUENT_GAP):
                return True
            # 7. in last hit the NumberOfDrawsWhenHit > 15 and current distance < 7
            if (num["IsHit"]  
                and num["NumberOfDrawsWhenHit"] > self.COLD_DISTANCE
                and number["Distance"] < self.LESS_FREQUENT_HITS):
                return True
    
        
    def collect_potential_numbers(self):
        numbers = self.data[0]["Numbers"]
        potential_numbers = [x for x in numbers if self.is_a_potential_number(x)]
        missing_numbers = [x for x in numbers if x not in potential_numbers]
        
        return potential_numbers, missing_numbers

        

    def next_potential_draws(self):
        results = [[]]
        self.remaining = self.numbers
        re = []
        for _ in range(self.rows):
            flip_coin = random.randint(1, 2)
            flip_coin2 = random.randint(1, 2)                
            if flip_coin2 == 1:
                re = self.get_numbers_based_on_total_hits()
            elif flip_coin == 2:
                re = self.next_potential_draws_1()             
            else:
                re = self.next_potential_draws_2()
            if (len(re) > self.columns):
                re.pop()
            results.append(re)
            
        no_empty_array_results = [arr for arr in results if arr]
        for arr in no_empty_array_results:
            for a in arr:
                if a in self.remaining:
                    self.remaining.remove(a)
                    self.hitting.append(a)
                

        no_empty_array_results.extend((
            self.remaining,
            sorted(self.hitting, key=lambda x : x["Value"], reverse=False)
        ))

        #print(f"no_empty_array_results = {no_empty_array_results}")
        
        #logging.debug(f"no_empty_array_results: {no_empty_array_results}")
        return no_empty_array_results

    ##### Libs #####
    
    def append_prediction(self, source_list,prediction_list, loop):
        for _ in range(loop):
            index = random.randint(0, len(source_list) - 1)
            prediction_list.append(source_list[index])


    def next_potential_draws_1(self):
        pred = []

        # take 1 from last hits
        lastHits = self.getLastHitNumbers()
        # print(f"lastHits = {lastHits}")
        self.append_prediction(lastHits, pred, 1)

        flip_coin = random.randint(1, 2)

        arr = (
            self.getTotalHitsNumbers() if flip_coin == 1 else self.getDistanceNumbers()
        )

        low = arr[0]
        middle = arr[1]
        high = arr[2]

        # take 1 from low
        self.append_prediction(low, pred, 1)

        # take 1 from middle
        self.append_prediction(middle, pred, 1)

        if flip_coin == 1:
            # add 2 from DistanceNumbers
            self.append_prediction(low, pred, 1) 
            self.append_prediction(high, pred, 1) 
        else:
            # take 2 from TotalHitsNumbers
            self.append_prediction(high, pred, 1) 
            self.append_prediction(middle, pred, 1) 

        pred = self.remove_duplicates(pred)

        # take 1 from Two_Hots_1_Cold_Numbers
        hots_cold = self.get_hots_cold_numbers()
        if hots_cold != []:
            self.append_prediction(hots_cold, pred, 1)
        else:
            semi_cold_numbers = self.get_semi_cold_numbers()
            if semi_cold_numbers != []:
                self.append_prediction(semi_cold_numbers, pred, 1)

        pred = self.remove_duplicates(pred)
        while len(pred) < self.columns:
            if len(hots_cold) > 1:
                self.append_prediction(hots_cold, pred, 1)
            else:
                frequent = self.get_frequent_numbers()
                self.append_prediction(frequent, pred, 1)

            pred = self.remove_duplicates(pred)
        pred.sort(key=lambda x: x["Value"], reverse=False)
        return pred

            

    def next_potential_draws_2(self):
        pred = []

        # take 1 from last hits
        cold_numbers = self.getLastHitNumbers()
        self.append_prediction(cold_numbers, pred, 1)       

        # frequent numbers
        frequent = self.get_frequent_numbers()

        # take 3 from frequent
        if len(frequent) > 3:
            self.append_prediction(frequent, pred, 3)
                    
        hots_cold = self.get_hots_cold_numbers()
        if len(hots_cold) > 0:
            self.append_prediction(hots_cold, pred, 1)
        else:
            cold_numbers = self.get_cold_numbers()
            self.append_prediction(cold_numbers, pred, 1)

        # take 1 from two_cold
        semi_cold = self.get_semi_cold_numbers()
        if len(semi_cold) > 0:
            self.append_prediction(semi_cold, pred, 1)
        else:
            cold_numbers = self.get_cold_numbers()
            self.append_prediction(cold_numbers, pred, 1)

        pred = self.remove_duplicates(pred)
        while len(pred) < self.columns:
            flip_coin = random.randint(1, 2)
            arr = (
                self.getTotalHitsNumbers()
                if flip_coin == 1
                else self.getDistanceNumbers()
            )
            # take 1 from DistanceNumbers or totalHitsNumbers
            index = random.randint(0, 2)
            sub_index = random.randint(0, len(arr[index]) - 1)
            pred.append(arr[index][sub_index])
            pred = self.remove_duplicates(pred)

        pred.sort(key=lambda x: x["Value"], reverse=False)
        return pred

    def getLastHitNumbers(self):
        arr = [x for x in self.numbers if x["IsHit"] == True]
        arr = sorted(arr, key=lambda x: x["Value"], reverse=False)

        ones = []
        tens = []
        twenties = []
        thirties = []
        forties = []

        ones = [x for x in arr if x["Value"] < 10]
        tens = [x for x in arr if 10 <= x["Value"] < 20]
        twenties = [x for x in arr if 20 <= x["Value"] < 30]
        thirties = [x for x in arr if 30 <= x["Value"] < 40]
        forties = [x for x in arr if x["Value"] >= 40]

        arrays = [ones, tens, twenties, thirties, forties]

        removed_empty_arrays = [sublist for sublist in arrays if any(sublist)]

        # index = random.randint(0, len(arrays) - 1)
        longest_array = []
        max1 = 0
        for ar in removed_empty_arrays:
            if len(ar) > max1:
                max1 = len(ar)
                longest_array = ar
            elif len(ar) == max1:
                longest_array += ar

        return longest_array

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
        return [low, middle, high]

    def getDistanceNumbers(self):
        arr = sorted(self.numbers, key=lambda x: x["Distance"], reverse=False)
        low = []
        middle = []
        high = []
        arr_len = len(arr)
        one_third = int(arr_len / 3 + 1)
        two_third = int(arr_len * 2 / 3 + 1)

        for i in range(arr_len):
            if arr[i]["Distance"] == 0:
                continue
            if i < one_third:
                low.append(arr[i])
            elif i < two_third:
                middle.append(arr[i])
            else:
                high.append(arr[i])

        return [low, middle, high]

    # new algorithm

    def get_frequent_numbers(self):
        frequent = []
        frequent.extend(n for n in self.numbers if self.get_frequent(n))
        return frequent
    
    def get_frequent(self, number):
        data = self.data
        distance_from_previous_hit = 0
        current_draw = data[0]
        number_of_hits = 0
        for draw_count, da in enumerate(data, start=1):
            numbers = da["Numbers"]
            num = [x for x in numbers if x["Value"] == number["Value"]][0]
            if (
                num["Distance"] < self.FREQUENT_GAP
                and number_of_hits >= self.FREQUENT_HITS
                and draw_count < self.HOTS_COLD
                and distance_from_previous_hit < self.FREQUENT_GAP
            ):
                return True
            elif num["Distance"] > self.FREQUENT_GAP or distance_from_previous_hit >= self.FREQUENT_GAP :
                return False

            if num["IsHit"] == True:
                number_of_hits += 1
                distance_from_previous_hit = 0
            else:
                distance_from_previous_hit += 1 



    def get_hots_cold_numbers(self):
        hots_cold = []
        hots_cold.extend(n for n in self.numbers if self.get_hots_cold(n))
        return hots_cold

    def get_hots_cold(self, number):
        data = self.data
        distance_from_previous_hit = 0
        number_of_hits = 0
        current_draw = data[0]
        for draw_count, da in enumerate(data, start=1):
            numbers = da["Numbers"]
            num = [x for x in numbers if x["Value"] == number["Value"]][0]
            if num["IsHit"] == True and da["DrawNumber"] == current_draw["DrawNumber"]:
                return False
            elif (
                num["Distance"] >= self.COLD_DISTANCE
                and number_of_hits > 1
                and draw_count < self.HOTS_COLD
                and 1 <= number_of_hits <= self.FREQUENT_HITS
            ):
                return True
            elif num["Distance"] < self.COLD_DISTANCE and draw_count > self.HOTS_COLD:
                return False

            if num["IsHit"] == True:
                number_of_hits += 1
                distance_from_previous_hit = 0
            else:
                distance_from_previous_hit += 1

    def get_cold_numbers(self):
        colds = []
        colds.extend(
            n for n in self.numbers if n["Distance"] >= self.COLD_DISTANCE
        )
        return colds

    def get_semi_cold_numbers(self):
        semi_cold = []
        semi_cold.extend(
            n for n in self.numbers if self.get_semi_cold(n)
        )
        return semi_cold

    def get_semi_cold(self, number):
        data = self.data
        current_draw = data[0]
        number_of_hits = 0
        for da in data:
            numbers = da["Numbers"]
            num = [x for x in numbers if x["Value"] == number["Value"]][0]
            if num["IsHit"] == True and da["DrawNumber"] == current_draw["DrawNumber"]:
                return False
            elif (
                num["IsHit"] == True
                and num["NumberOfDrawsWhenHit"] >= self.COLD_DISTANCE
                and number_of_hits == 0
            ):
                return True
            elif number_of_hits > 0:
                return False
            # elif num["Distance"] < self.COLD_DISTANCE and draw_count > self.HOTS_COLD:
            #    return False

            if num["IsHit"] == True:
                number_of_hits += 1

    def get_hits_range_arrays(self, numbers):
        lowest_hits_array = []
        two_fifth_array = []
        three_fifth_array = []
        four_fifth_array = []
        highest_hits_array = []
        array = []
        arr = sorted(numbers, key=lambda x: x["TotalHits"], reverse=False)

        one_fifth = int(len(arr) / 5 + 1)
        two_fifth = int((len(arr) * 2) / 5 + 1)
        three_fifth = int((len(arr) * 3) / 5 + 1)
        four_fifth = int((len(arr) * 4) / 5 + 1)

        for i in range(len(arr)):
            if i < one_fifth:
                lowest_hits_array.append(arr[i])
            elif i < two_fifth:
                two_fifth_array.append(arr[i])
            elif i < three_fifth:
                three_fifth_array.append(arr[i])
            elif i < four_fifth:
                four_fifth_array.append(arr[i])
            else:
                highest_hits_array.append(arr[i])

        return [
            lowest_hits_array,
            two_fifth_array,
            three_fifth_array,
            four_fifth_array,
            highest_hits_array,
        ]

    def get_hits_in_number_range(self, numbers, isForHotHitsRange):
        arr = self.get_hits_range_arrays(numbers)     
        array = []
        if isForHotHitsRange == True:
            highest_hits_array = arr[4]
            array.extend(
                highest_hits_array[i]
                for i in range(len(highest_hits_array))
                if highest_hits_array[i]["Distance"] > self.HITS_MIN_DISTANCE
            )
        else:
            lowest_hits_array = arr[0]
            array.extend(
                lowest_hits_array[i]
                for i in range(len(lowest_hits_array))
                if lowest_hits_array[i]["Distance"] > self.HITS_MIN_DISTANCE
            )

        return array

    def is_hot_in_highest_hits_range(self, isForPrevious):
        arr = self.get_hits_in_number_range(
            self.prev_draw_numbers if isForPrevious else self.numbers, True
        )
        filtered_arr = [a for a in arr if a["Distance"] == 0]
        return len(filtered_arr) > 1

    def is_hot_in_lowest_hits_range(self, isForPrevious):
        arr = self.get_hits_in_number_range(
            self.prev_draw_numbers if isForPrevious else self.numbers, False
        )
        filtered_arr = [a for a in arr if a["Distance"] == 0]
        return len(filtered_arr) > 1

    #
    def get_numbers_based_on_total_hits(self):
        arr = self.get_hits_range_arrays(self.numbers)
        lowest_hits_array = arr[0]
        two_fifth_array = arr[1]
        three_fifth_array = arr[2]
        four_fifth_array = arr[3]
        highest_hits_array = arr[4]
        array = []
        # check if previous hot in highest hits range
        if self.is_hot_in_highest_hits_range(True) == True:
            # check if previous hot in lowest hits range
            if self.is_hot_in_lowest_hits_range(True) == True:
                # now focus on middle ranges
                self.append_prediction(two_fifth_array, array, 1)
                self.append_prediction(three_fifth_array, array, 1)
                self.append_prediction(four_fifth_array, array, 1)
                
            else:
                # now focus on 2 lowest and 1 middle ranges 1 highest
                # lowest
                self.append_prediction(lowest_hits_array, array, 2)             

            # middle
            self.append_prediction(four_fifth_array, array, 1)
        elif self.is_hot_in_lowest_hits_range(True) == True:
                # now focus on highest and middle ranges
                # 2 highest
                self.append_prediction(highest_hits_array, array, 2)
                
                # 1 middle
                self.append_prediction(two_fifth_array, array, 1)
        else:
            # now focus on lowest and highest
            # 1 highest
            self.append_prediction(highest_hits_array, array, 1)

            # 2 lowest
            self.append_prediction(lowest_hits_array, array, 2)  

        # 1 cold
        colds = self.get_cold_numbers()
        self.append_prediction(colds, array, 1)  

        # 1 semi cold
        semi_cold = self.get_semi_cold_numbers()
        self.append_prediction(semi_cold, array, 1)

        # 1 hots_cold
        hots_cold = self.get_hots_cold_numbers()
        self.append_prediction(hots_cold, array, 1)

        pred = self.remove_duplicates(array)
        while len(pred) < self.columns:
            self.append_prediction(highest_hits_array, pred, 1)
            pred = self.remove_duplicates(pred)

        pred.sort(key=lambda x: x["Value"], reverse=False)

        return pred

    def remove_duplicates(self, objects):
        seen_values = set()
        unique_objects = []

        for obj in objects:
            if obj["Value"] not in seen_values:
                seen_values.add(obj["Value"])
                unique_objects.append(obj)

        return unique_objects

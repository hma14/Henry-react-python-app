from collections import Counter

def categorize_numbers(lottoName, numbers):
    # Define the category ranges
    max_number = 49 
    last_category = '40-49'
    if lottoName == 3:       
        max_number = 52
        last_category = '40-52'      
    categories = {
                '1-9': range(1, 10),
                '10-19': range(10, 20),
                '20-29': range(20, 30),
                '30-39': range(30, 40),
                last_category: range(40, max_number + 1)
            }
    
    # Initialize a Counter for the categories
    category_counts = Counter()
   
    # Categorize each number
    for num in numbers:
        # Validate number is in range [1, max_number]
        if not (1 <= num <= max_number):
            raise ValueError(f"Number {num} is out of range [1, {max_number}]")
        
        # Find the category for the number
        for category, num_range in categories.items():
            if num in num_range:
                category_counts[category] += 1
                break
    
    # Ensure all categories are present in the output, even with zero counts
    for category in categories:
        if category not in category_counts:
            category_counts[category] = 0
            
    return dict(category_counts)

# Example usage
""" 
numbers = [8, 15, 22, 35, 41, 7]
result = categorize_numbers(numbers)
print(result)  # Output: {'1-9': 2, '10-19': 1, '20-29': 1, '30-39': 1, '40-52': 1} 
"""
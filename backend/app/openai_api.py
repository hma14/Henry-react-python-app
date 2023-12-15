import os
from openai import OpenAI
from config import Config

def get_string_response():
    ret = "To generate random numbers based on the given historical data, we should first analyze the frequency of each number in the prior results. \
        But I'm an AI text-based model and unable to calculate actual randomness or probabilities directly from the historical data. However, \
            I can suggest a pseudo-random set of 7 numbers that fall within the range of numbers seen in your history which is between 1 and 50. \
                This cannot guarantee any kind of correlation or accuracy to past patterns, but here's an example: Random numbers: 10, 22, 33, 18, 21, 43, 50. \
                    You could use an actual statistical software or a lottery number generator to give you a better accurate prediction."
    return ret

def get_openai_response():    
    
    client = OpenAI(api_key=Config.OPEN_AI_KEY)
    
    conversation = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "here are DrawNumber and Number1, ... Number7 stats in the past, \
                generate a set of 7 random numbers based on following history?"},
    
        {"role": "user", "content": \
               "951 4	17	20	23	25	27	41, \
                952	5	6	12	28	33	41	47, \
                953	8	17	20	23	28	31	33, \
                954	2	7	15	16	18	19	25, \
                955	3	18	19	21	25	46	50, \
                956	4	15	16	17	23	27	47, \
                957	6	17	25	28	30	34	36, \
                958	5	7	9	10	19	24	40, \
                959	7	12	15	16	35	45	48, \
                960	1	18	25	26	30	34	39"},
    ]
    generated_content = ""
    response = client.chat.completions.create(model="gpt-4-1106-preview", messages=conversation,  max_tokens=500 )

    if response and response.choices and response.choices[0]:
        generated_content = response.choices[0].message.content
        print("Generated Content:", generated_content)
    else:
        generated_content =  "No content generated."
        print("No content generated.")
        
    return generated_content



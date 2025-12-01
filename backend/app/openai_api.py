import os
import openai
from config import Config
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def get_string_response():
    return """ Certainly! Distillation in the context of AI models, particularly in machine learning, refers to a technique called **model distillation** or **knowledge distillation**. This process involves transferring knowledge from a large, complex model (often referred to as the "teacher" model) to a smaller, simpler model (the "student" model). The goal is to create a smaller model that can perform similarly to the larger model but with reduced computational resources, making it more efficient for deployment. ### How Does Distillation Work? 1. **Teacher Model**: A large, pre-trained model (e.g., a deep neural network) is used as the teacher. This model is typically highly accurate but computationally expensive. 2. **Student Model**: A smaller, simpler model is trained to mimic the behavior of the teacher model. The student model has fewer parameters and is designed to be more efficient. 3. **Soft Targets**: Instead of training the student model directly on the hard labels (e.g., class labels in classification tasks), the student is trained on the "soft targets" produced by the teacher model. Soft targets are the probability distributions over classes (outputs of the teacher''s softmax layer), which contain more nuanced information than hard labels. 4. **Loss Function**: The student model is trained using a loss function that minimizes the difference between its predictions and the teacher's soft targets. This often involves a combination of: - **Distillation Loss**: Measures how well the student's output matches the teacher''s soft targets. - **Cross-Entropy Loss**: Ensures the student still learns from the true labels (hard targets). 5. **Temperature Scaling**: During distillation, a "temperature" parameter is often applied to the softmax function of the teacher model. This softens the probability distribution, making it easier for the student to learn from the teacher's outputs. ### Why Use Distillation? - **Efficiency**: The student model is smaller and faster, making it suitable for deployment on devices with limited computational resources (e.g., mobile phones, IoT devices). - **Performance**: The student model can achieve performance close to the teacher model, even with fewer parameters. - **Generalization**: The student model often generalizes better because it learns from the teacher's rich, probabilistic outputs rather than just hard labels. ### Applications of Distillation - **Model Compression**: Reducing the size of large models for deployment in resource-constrained environments. - **Ensemble Distillation**: Combining the knowledge of multiple teacher models into a single student model. - **Transfer Learning**: Using a pre-trained teacher model to guide the training of a student model on a new task. ### Example Suppose you have a large, state-of-the-art language model like GPT-4. You can use distillation to create a smaller version of this model that retains much of its performance but is lightweight enough to run on a smartphone. The smaller model learns from the outputs of GPT-4, capturing its "knowledge" in a more compact form. In summary, distillation is a powerful technique for creating efficient, high-performing AI models by transferring knowledge from larger, more complex models to smaller, more practical ones."""


def get_openai_response() -> str:    
    
    client = openai(api_key=OPENAI_API_KEY) # pyright: ignore[reportCallIssue]
    
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
    response = client.chat.completions.create(model="gpt-4o", messages=conversation,  max_tokens=500 )

    if response and response.choices and response.choices[0]:
        generated_content = response.choices[0].message.content
        print("Generated Content:", generated_content)
    else:
        generated_content =  "No content generated."
        print("No content generated.")
        
    return generated_content



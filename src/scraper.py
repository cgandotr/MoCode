from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
import time
import json

# Set up the WebDriver
driver = webdriver.Chrome()  # Path to your WebDriver, e.g., 'path/to/chromedriver'

# Open the webpage
driver.get('https://neetcode.io/practice')

# Topics to scrape
topics = ["Arrays & Hashing", "Two Pointers", "Sliding Window", "Stack", "Binary Search", "Linked List", "Trees", "Tries", "Heap / Priority Queue", "Backtracking", "Graphs", "Advanced Graphs", "1-D Dynamic Programming", "2-D Dynamic Programming", "Greedy", "Intervals", "Math & Geometry", "Bit Manipulation", "JavaScript"]

# Store scraped questions
all_questions = []

# Wait for the main elements to load
time.sleep(2)

# Click on the 'Practice' button
practice_button = driver.find_element(By.XPATH, "//span[contains(text(), 'Practice')]")
practice_button.click()
time.sleep(2)

# Click on the 'NeetCode All' option
neetcode_all_button = driver.find_element(By.XPATH, "//span[contains(text(), 'NeetCode All')]")
neetcode_all_button.click()
time.sleep(2)

for topic in topics:
    # Navigate to and click on the topic
    topic_xpath = f"//button/p[contains(text(), '{topic}')]/.."
    topic_button = driver.find_element(By.XPATH, topic_xpath)
    topic_button.click()

    # Wait and scroll to ensure all questions in the topic are loaded
    time.sleep(2)
    ActionChains(driver).move_to_element(topic_button).perform()

    # Scrape the questions
    question_elements = driver.find_elements(By.CSS_SELECTOR, 'a.table-text.text-color')
    
    for element in question_elements:
        
        question_text = element.text.strip()
        question_url = element.get_attribute('href').strip()

        # Find the <td> element with class 'diff-col' that is an ancestor of the question element
        difficulty_td = element.find_element(By.XPATH, ".//ancestor::tr/td[contains(@class, 'diff-col')]")

        # Within this <td>, find the <button> element which contains the difficulty text
        difficulty_button = difficulty_td.find_element(By.TAG_NAME, 'button')
        difficulty_text = difficulty_button.text.strip() if difficulty_button else "Unknown"

        if question_text:
            all_questions.append({
                'title': question_text,
                'link': question_url,
                'difficulty': difficulty_text,
                'category': topic
            })
    
    # Click on the topic again to close it
    topic_button.click()
    time.sleep(2)

# Save all scraped data to a JSON file
with open('problems.json', 'w') as f:
    json.dump(all_questions, f, indent=4)

# Close the browser
driver.quit()

print("Scraping completed and data saved to problems.json")

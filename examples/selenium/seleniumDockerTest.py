from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


print("Test Execution Started")

options = webdriver.ChromeOptions()
options.add_argument('--ignore-ssl-errors=yes')
options.add_argument('--ignore-certificate-errors')
options.add_argument("--disable-dev-shm-usage")  # useful in Docker
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")

driver = webdriver.Remote(
    command_executor='http://localhost:4444/wd/hub',
    options=options
)

try:
    # Create a WebDriverWait instance with a timeout of 10 seconds
    wait = WebDriverWait(driver, 10)

    # maximize the window size
    driver.maximize_window()

    # Navigate to VNC-Viewer extension page
    driver.get("https://hub.docker.com/extensions/pgmystery/docker-extension-vnc")

    # Wait for the GitHub link to be present and visible
    wait.until(
        EC.presence_of_element_located((By.PARTIAL_LINK_TEXT, "GitHub"))
    )

    # Wait for the element to be clickable
    github_link_element = wait.until(
        EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, "GitHub"))
    )

    # Scroll the element into view
    driver.execute_script("arguments[0].scrollIntoView(true);", github_link_element)

    # Wait a brief moment for the scroll to complete and element to be fully visible
    wait.until(
        lambda driver: driver.execute_script(
            "var rect = arguments[0].getBoundingClientRect(); " +
            "return (rect.top >= 0 && rect.bottom <= window.innerHeight);",
            github_link_element
        )
    )

    # Click the element
    github_link_element.click()

    time.sleep(5)

    print("Test Execution Successfully Completed!")
except Exception as e:
    print(f"An error occurred: {e}")
finally:
    # close the browser
    driver.close()
    driver.quit()

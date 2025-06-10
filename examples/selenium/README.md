# 🧪 Run Selenium Chrome Tests in Docker Desktop VNC Extension

This tutorial shows how to **run and view Selenium tests in real-time** using the official `selenium/standalone-chrome` Docker image inside the [Docker Desktop VNC Extension](https://github.com/pgmystery/docker-extension-vnc).

No custom Dockerfiles or terminal setup needed — just point-and-click.

---

## 📋 Requirements

- Python >= 3.9.
- Docker Desktop with VNC Extension.

---

## 🖥️ Step-by-Step: Run Selenium Chrome Inside the VNC Desktop

### 1. Create a New Session

- Open the VNC Desktop Extension
- Click `➕ New Session`

Fill out the form like this:

| Field                                   | Value                               |
|-----------------------------------------|-------------------------------------|
| **Session Name**                        | `Selenium (chrome)`                 |
| **Connection-Type**                     | `Docker Image`                      |
| **Docker Image**                        | `selenium/standalone-chrome`        |
| **Image Tag**                           | `latest`                            |
| **Docker Run Options**                  | `-p 4444:4444 -e VNC_NO_PASSWORD=1` |
| **VNC Port**                            | `5900`                              |
| **✅ Remove Container After Disconnect** | ✔️ Checked                          |


### 2. Start the Session

- Click "Connect"
- The VNC Desktop will automatically connect to the VNC Server of `selenium/standalone-chrome`
- You will see **Chrome preinstalled** and a **terminal**

### 3. Install Requirements

Before running the tests, make sure to install the required dependencies:

```shell
pip install -r requirements.txt
```

### 4. Run the Selenium Test Script

Execute the provided test script:

```shell
shell python seleniumDockerTest.py
```

🧠 This script will:

- Launch Chrome
- Navigate to the Docker Extension VNC page
- Click on the GitHub link
- Close the browser automatically

You will see the browser open and run live inside the docker desktop.

---

## 🚀 What This Shows

- You can debug tests visually using real Chrome UI
- No need to build Docker images or use CLI
- Fully isolated browser test environment, visible in Docker Desktop

## 💡 Bonus: Develop Live in Container

You can:
- Open terminal inside the container
- `pip install` libraries
- Write or paste new test cases
- View test runs in real time via Chrome


---

Made with ❤️ by [@pgmystery](https://github.com/pgmystery)

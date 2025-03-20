# Uptime Site Monitoring Web App (Node.js)
[GitHub Repo Link](https://github.com/NexusHayStack/NodeJS_Repo) 

A Simple Web App to create and manage checks to monitor site status

---

## Table of Contents

1. [Features](#features)  
2. [Installation](#installation)  
3. [Environment Variables](#environment-variables)  
4. [Usage](#usage)  
5. [Project Structure](#project-structure)  
6. [Contributing](#contributing)  

---

## Features

- **Google Sign-In** for user authentication.  
- **Shorten URLs** and organize them under specific topics.  
- **Detailed Analytics** for individual and overall URLs.  
- **Rate Limiting** to prevent abuse.  
- **Redis Integration** for caching.  
- **HTTPS** for secure connections.  

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) installed.  
- [Docker](https://www.docker.com/) installed.  

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/NexusHayStack/NodeJS_Repo.git
   cd NodeJS Repo/My NodeJS DIR/Section 4
   ```

2. Install dependencies:
   
   No Dependencies at all!! ¯\_(ツ)_/¯


3. Run the App
  ```bash
  PS: C: path-to-your-folder\NodeJS Repo\My NodeJS DIR\Section 4\my-app> node index.js
  Initializing...
  Background workers are now running
  Calling all Checks...
  The Server is now listening on port 3000 in staging mode
  The Server is now listening on port 3001 in staging mode
  ```

4. Your app should now be running at `http://localhost:3000` OR `http://localhost:3001`.

---

## Usage
1. When on the browser 
  ![Sight](<Section 4/README_Images/Screenshot 2025-03-20 212159.png>)


  Create an Account
  ![Sign-Up](<Section 4/README_Images/Screenshot 2025-03-20 212323.png>)

  OR Sign In
  ![Sign-In](<Section 4/README_Images/Screenshot 2025-03-20 212622.png>)

2. Go to your “DASHBOARD” on the menu and create a check (if haven't already)
  ![Dashboard](<Section 4/README_Images/Screenshot 2025-03-20 213113.png>)

  __*Note: You can only create a maximum of 5 checks__ 

3. Create Checks
  ![Checks](<Section 4/README_Images/Screenshot 2025-03-20 213543.png>)
    **Enter Protocol** (HTTP or HTTPS)
    ![Protocols](<My NodeJS DIR/Section 4/README_Images/Screenshot 2025-03-20 214925.png>)

    **URL**(eg: google.com)
    ![URL](<Section 4/README_Images/Screenshot 2025-03-20 215015.png>)

    **Success Codes** (What should be the Success Code for the status to be “UP”)
    ![Codes](<Section 4/README_Images/Screenshot 2025-03-20 215221.png>)

    **HTTP Method** (GET, PUT, POST, DELETE - If you want to check site health for accessing/reading the site just enter “GET”, and if you want to check site health for when you enter a new data select “PUSH”, “PUT” to edit/write)
    ![Method](<Section 4/README_Images/Screenshot 2025-03-20 215139.png>)
    
    **Time Out** (Within how many seconds should the site respond for the status to be "UP")
    ![TimeOut](<Section 4/README_Images/Screenshot 2025-03-20 235552.png>)

 
---

## Project Structure

```plaintext
.
|-- My NodeJS DIR
|   |-- Section 3
|   |   `-- my-app
|   |       |-- https
|   |       |   |-- cert.pem
|   |       |   `-- key.pem
|   |       |-- index.js
|   |       `-- lib
|   |           |-- config.js
|   |           |-- data.js
|   |           |-- handlers.js
|   |           |-- helpers.js
|   |           |-- logs.js
|   |           |-- server.js
|   |           `-- workers.js
|   `-- Section 4
|       `-- my-app
|           |-- https
|           |   |-- cert.pem
|           |   `-- key.pem
|           |-- index.js
|           |-- lib
|           |   |-- config.js
|           |   |-- data.js
|           |   |-- handlers.js
|           |   |-- helpers.js
|           |   |-- logs.js
|           |   |-- server.js
|           |   `-- workers.js
|           |-- public
|           |   |-- app.css
|           |   |-- app.js
|           |   |-- favicon.ico
|           |   |-- logo.png
|           |   `-- test.jpg
|           `-- templates
|               |-- _footer.html
|               |-- _header.html
|               |-- accountCreate.html
|               |-- accountDeleted.html
|               |-- accountEdit.html
|               |-- checksCreate.html
|               |-- checksEdit.html
|               |-- checksList.html
|               |-- index.html
|               |-- sessionCreate.html
|               `-- sessionDeleted.html

```

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.  
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
---

# Smart Energy Meter – Frontend (React)

This repository contains the **frontend application** for the Smart Energy Meter system.  
It provides a **web-based dashboard** to visualize real-time and historical energy consumption data collected from smart meters.

---

## 📌 Project Overview

The frontend allows users to:
- View real-time energy usage
- Monitor historical consumption data
- Manage registered smart meters
- Securely access data using authentication

It communicates with the backend using **REST APIs** and displays energy data in a user-friendly dashboard.

---

## 🧠 Architecture Overview

```text
React Frontend
      |
      | (REST APIs)
      v
Node.js / Express Backend
      |
      | (MongoDB)
      v
   Energy Data Store

# 📱 Mobile App Setup Instructions - For Dristant (Kotlin/Android)

## 📚 **What You're Building**
You're building the **native Android mobile app** for our project using Kotlin. Your app will:
- Allow users to browse products, search, and view recommendations
- Support image upload for virtual try-on
- Connect to Vedika's GraphQL API for data
- Display AI-powered recommendations and try-on results

## 🛠️ **Tech Stack You'll Use**
- **Kotlin** → Modern language for Android development
- **Android Studio** → Official IDE for Android
- **Gradle** → Build system for Android projects
- **Apollo GraphQL Client** → For connecting to backend API
- **Retrofit/OkHttp** → For REST/GraphQL calls (if needed)
- **Camera/Image Picker** → For virtual try-on

---

## 🏗️ **Understanding Our Project Structure**

### **What is a Monorepo?**
A monorepo is like having multiple related projects in one big folder:
```
walmart-sparkathon/
├── apps/web     → Harshit's Next.js website
├── apps/api     → Vedika's backend server
├── apps/mobile  → YOUR Android app ✨
├── apps/ai      → Manodeep's AI service
```
**Benefit**: Everyone can share code and work together easily!

### **What is Turborepo?**
Turborepo helps run multiple apps at once (mainly for JS/TS apps). For Android, you use Gradle/Android Studio, but keep your code in the monorepo for team collaboration.

### **What is pnpm?**
You don't need pnpm for Android, but it's used for the web/api/ai apps in the monorepo.

---

## 🚀 **Step-by-Step Setup**

### **1️⃣ Install Android Studio**
- Download from: https://developer.android.com/studio
- Install and open Android Studio

### **2️⃣ Open the Project**
- In Android Studio, select **Open** and choose `apps/mobile/`
- If the folder is empty, create a new project inside `apps/mobile/` (use "Empty Activity" template, language: Kotlin)

### **3️⃣ Project Structure**
Your folder should look like:
```
apps/mobile/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/yourteam/yourapp/
│   │   │   ├── res/
│   │   │   └── AndroidManifest.xml
│   └── build.gradle
├── build.gradle
├── settings.gradle
└── ...
```

### **4️⃣ Add Dependencies**
- In `app/build.gradle`, add:
```gradle
dependencies {
    implementation 'com.apollographql.apollo3:apollo-runtime:3.8.2' // For GraphQL
    implementation 'com.squareup.retrofit2:retrofit:2.9.0' // For REST (if needed)
    implementation 'com.squareup.okhttp3:okhttp:4.9.3'
    implementation 'androidx.core:core-ktx:1.10.1'
    // Add camera/image picker dependencies as needed
}
```
- Click **Sync Now** in Android Studio

### **5️⃣ Connect to GraphQL API**
- Use Apollo Android client to connect to Vedika's API
- Example: https://www.apollographql.com/docs/kotlin/

### **6️⃣ Implement Features**
- Home screen: Product feed
- Search: Text input, send query to API
- Try-on: Image picker/camera, upload to API
- Profile: User info and preferences

---

## 🆘 **Need Help?**
- **Android Studio setup:** https://developer.android.com/studio/intro
- **Kotlin basics:** https://kotlinlang.org/docs/home.html
- **Apollo GraphQL Android:** https://www.apollographql.com/docs/kotlin/
- **Ask Harshit or the team for help anytime!**

---


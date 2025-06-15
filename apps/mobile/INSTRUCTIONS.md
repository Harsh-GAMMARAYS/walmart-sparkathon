# 📱 Mobile App Setup Instructions - For Dristant

## 📚 **What You're Building**
You're building the **mobile app** that will provide:
- Multi-modal input interface (text, voice, image upload)
- Product browsing and recommendations
- Virtual try-on feature (display AI-generated images)
- User profile and preferences
- Seamless shopping experience

## 🛠️ **Tech Stack You'll Use**
- **React Native** → Build mobile apps using React/JavaScript
- **TypeScript** → Strongly typed JavaScript (REQUIRED for this project)
- **Expo** → Tools that make React Native development easier
- **GraphQL Client** → To fetch data from Vedika's API
- **Camera/Image Picker** → For virtual try-on feature

## 🚨 **Important: TypeScript is Required**
We're using TypeScript for better code quality and team collaboration:
- ✅ **Catch errors before runtime**
- ✅ **Better IDE support and autocomplete**
- ✅ **Type safety when connecting to APIs**
- ✅ **Easier for teammates to understand your code**

---

## 🏗️ **Understanding Our Project Structure**

### **What is a Monorepo?**
A monorepo is like having multiple related projects in one big folder:
```
walmart-sparkathon/
├── apps/web     → Harshit's Next.js website
├── apps/api     → Vedika's backend server
├── apps/mobile  → YOUR mobile app ✨
├── apps/ai      → Manodeep's AI service
```
**Benefit**: Everyone can share code and work together easily!

### **What is Turborepo?**
Turborepo helps run multiple apps at once:
- `pnpm dev --filter mobile` → Runs ONLY your mobile app
- `turbo run dev` → Runs ALL apps together
- Caches builds to make everything faster

### **What is pnpm?**
pnpm is like npm, but faster and better for monorepos:
- `pnpm install` → Installs dependencies
- `pnpm add react-native-camera` → Adds new packages
- Works across all apps in the monorepo

---

## 🚀 **Step-by-Step Setup**

### **1️⃣ Initialize Your Mobile App**
```bash
# Go to your folder
cd apps/mobile

# Create Expo app
npx create-expo-app . --template

# Choose "Blank (TypeScript)" template
```

### **2️⃣ Install Additional Dependencies**
```bash
# Navigation (for moving between screens)
pnpm add @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs

# Expo dependencies
pnpm add expo-camera expo-image-picker expo-av

# GraphQL client (to connect to Vedika's API)
pnpm add @apollo/client graphql

# UI components
pnpm add react-native-elements react-native-vector-icons
```

### **3️⃣ Basic App Structure**
Create these folders in `apps/mobile/`:

```
apps/mobile/
├── src/
│   ├── screens/        → Different app screens
│   │   ├── HomeScreen.tsx
│   │   ├── ProductsScreen.tsx
│   │   ├── TryOnScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── components/     → Reusable UI components
│   │   ├── ProductCard.tsx
│   │   └── VoiceInput.tsx
│   ├── navigation/     → App navigation setup
│   │   └── AppNavigator.tsx
│   └── services/       → API calls
│       └── api.ts
├── App.tsx            → Main app file
└── package.json
```

### **4️⃣ Basic App.tsx Setup** (EXAMPLE)
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/screens/HomeScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import TryOnScreen from './src/screens/TryOnScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Products" component={ProductsScreen} />
        <Tab.Screen name="Try On" component={TryOnScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

### **5️⃣ Test Your Setup**
```bash
# Run your mobile app
pnpm start

# This will open Expo DevTools in your browser
# Scan QR code with Expo Go app on your phone
# OR press 'w' to open in web browser
```

---

## 📖 **React Native Basics**

### **What is React Native?**
- Write mobile apps using JavaScript/TypeScript
- Uses React concepts (components, state, props)
- Compiles to native iOS/Android code

### **What is Expo?**
- Tools and services for React Native
- Provides camera, image picker, audio recording
- Easy testing with Expo Go app
- Simplifies deployment

### **Basic Component Example:** (EXAMPLE)
```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Products</Text>
      <TextInput
        style={styles.input}
        placeholder="What are you looking for?"
        value={searchText}
        onChangeText={setSearchText}
      />
      <Button title="Search" onPress={() => console.log(searchText)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 5 }
});
```

---

## 🎯 **Your Main Tasks**

### **Phase 1: Basic Setup**
1. **Set up navigation** between screens
2. **Create basic UI** for each screen
3. **Test on your phone** with Expo Go

### **Phase 2: Connect to API**
1. **Connect to Vedika's GraphQL API** (get products)
2. **Display product list** with images and prices
3. **Add search functionality**

### **Phase 3: Advanced Features**
1. **Image picker** for virtual try-on
2. **Voice input** for search
3. **Camera integration** for AR (stretch goal)

---

## 🔧 **Useful Code Snippets**

### **GraphQL API Connection (TypeScript):** (EXAMPLE)
```typescript
import { ApolloClient, InMemoryCache, gql, useQuery } from '@apollo/client';
import { View, Text } from 'react-native';

// Define TypeScript interfaces for API data
interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

interface ProductsData {
  products: Product[];
}

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql', // Vedika's API
  cache: new InMemoryCache()
});

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      price
      image
    }
  }
`;

function ProductList(): JSX.Element {
  const { loading, error, data } = useQuery<ProductsData>(GET_PRODUCTS);
  
  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  
  return (
    <View>
      {data?.products.map((product: Product) => (
        <Text key={product.id}>{product.name} - ${product.price}</Text>
      ))}
    </View>
  );
}
```

### **Image Picker (TypeScript):** (EXAMPLE)
```typescript
import * as ImagePicker from 'expo-image-picker';

async function pickImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    const imageUri: string = result.assets[0].uri;
    console.log('Selected image:', imageUri);
    // Send image to AI service for try-on
    return imageUri;
  }
  
  return null;
}
```

---

## 🆘 **Need Help?**

### **Common Issues:**
- **Expo not starting** → Make sure you have Expo CLI installed globally
- **QR code not scanning** → Make sure phone and computer are on same WiFi
- **Dependencies not installing** → Run `pnpm install` from root directory first

### **Testing Your App:**
- Use Expo Go app on your phone for real device testing
- Use web browser for quick testing
- Use Android/iOS simulators for full testing

### **Resources:**
- [React Native Tutorial](https://reactnative.dev/docs/tutorial)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Docs](https://reactnavigation.org/docs/getting-started)
import { Request, Response } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized!' });
    }
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const migrateSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized!' });
    }

    const { sessionId, sessionData } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // Initialize activity if it doesn't exist (using any to bypass strict typing for now)
    const userDoc = user as any;
    if (!userDoc.activity) {
      userDoc.activity = {
        cart: [],
        viewedProducts: [],
        searchHistory: [],
        lastActivity: new Date()
      };
    }

    // Merge session data with user's existing activity
    if (sessionData.cart && sessionData.cart.length > 0) {
      // Add cart items to user's existing cart (avoiding duplicates)
      const existingCartIds = (userDoc.activity.cart || []).map((item: any) => item.id);
      const newCartItems = sessionData.cart.filter((item: any) => !existingCartIds.includes(item.id));
      
      // Push new items to the cart array
      for (const item of newCartItems) {
        userDoc.activity.cart.push(item);
      }
    }

    if (sessionData.viewedProducts && sessionData.viewedProducts.length > 0) {
      // Merge viewed products (avoiding duplicates)
      const existingViewed = userDoc.activity.viewedProducts || [];
      const newViewed = sessionData.viewedProducts.filter(
        (productId: string) => !existingViewed.includes(productId)
      );
      userDoc.activity.viewedProducts = [...newViewed, ...existingViewed].slice(0, 50);
    }

    if (sessionData.searchHistory && sessionData.searchHistory.length > 0) {
      // Merge search history (avoiding duplicates)
      const existingSearches = userDoc.activity.searchHistory || [];
      const newSearches = sessionData.searchHistory.filter(
        (query: string) => !existingSearches.includes(query)
      );
      userDoc.activity.searchHistory = [...newSearches, ...existingSearches].slice(0, 20);
    }

    userDoc.activity.lastActivity = new Date();
    await user.save();

    res.json({ 
      message: 'Session migrated successfully',
      activity: userDoc.activity 
    });
  } catch (error) {
    console.error('Session migration error:', error);
    res.status(500).json({ message: 'Server error during session migration' });
  }
}; 
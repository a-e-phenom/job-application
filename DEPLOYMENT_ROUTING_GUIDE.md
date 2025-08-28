# Deployment Routing Guide

This guide explains how to handle client-side routing when deploying your React application to different platforms.

## **The Problem**

When someone opens a direct link to a flow (e.g., `/flow/software-engineer-application`), the server tries to find a file at that path. Since this is a client-side route handled by React Router, the file doesn't exist, resulting in a 404 error.

## **Solutions by Platform**

### **1. Netlify**
The `public/_redirects` file is already configured:
```
/*    /index.html   200
```

This tells Netlify to serve `index.html` for all routes, allowing React Router to handle the routing.

### **2. Vercel**
The `vercel.json` file is already configured:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### **3. Apache Server**
The `public/.htaccess` file is already configured:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### **4. Nginx Server**
Add this to your nginx configuration:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### **5. Express.js Server**
If using Express.js, add this middleware:
```javascript
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

### **6. Development (Vite)**
The `vite.config.ts` is already configured with `historyApiFallback: true`.

## **Testing the Fix**

1. **Build your application**: `npm run build`
2. **Deploy to your platform** (Netlify, Vercel, etc.)
3. **Test direct links** by opening a flow URL in a new incognito window
4. **Verify** that the flow loads correctly instead of showing a 404 error

## **How It Works**

1. User opens `/flow/software-engineer-application`
2. Server receives the request
3. Server serves `index.html` (instead of looking for a file)
4. React Router takes over and matches the route
5. Application loads the correct flow

## **Common Issues**

- **404 errors persist**: Make sure the configuration files are in the correct location
- **Routes work locally but not deployed**: Check that your deployment platform supports the configuration
- **Build issues**: Ensure the configuration files are copied to the build output

## **Verification**

After deployment, test these scenarios:
- ✅ Direct link to homepage: `/`
- ✅ Direct link to flow: `/flow/[slug]`
- ✅ Direct link to edit: `/edit/[slug]`
- ✅ Direct link to create: `/create`
- ✅ Direct link to modules: `/modules`
- ✅ Invalid route: Should redirect to homepage

## **Platform-Specific Notes**

- **Netlify**: The `_redirects` file must be in the `public` folder
- **Vercel**: The `vercel.json` file must be in the root directory
- **Apache**: The `.htaccess` file must be in the `public` folder
- **Custom servers**: You'll need to implement the routing logic yourself

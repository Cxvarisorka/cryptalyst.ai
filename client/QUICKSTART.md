# Quick Start Guide - Cryptalyst.ai Client

## Get Started in 3 Steps

### 1. Start the Development Server

```bash
cd C:\Users\User\cryptalyst.ai\client
npm run dev
```

The application will be available at: **http://localhost:5173**

### 2. Explore the Application

Visit these routes to see the completed setup:

- **Home Page**: http://localhost:5173/
  - Hero section with gradient text
  - Feature cards with animations
  - Call-to-action buttons

- **Dashboard**: http://localhost:5173/dashboard
  - Overview tab with portfolio stats
  - Market data for 6 cryptocurrencies
  - Animated grid layout
  - Interactive tabs

- **About Page**: http://localhost:5173/about
  - Mission and technology overview
  - Feature highlights
  - Animated content

- **404 Page**: http://localhost:5173/random
  - Error handling example

### 3. Start Building

#### Add a New Page

1. Create a new page component:
```jsx
// src/pages/NewPage.jsx
import { FadeIn } from "@/components/magicui/fade-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-16">
        <FadeIn>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">New Page</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Your content here</p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
```

2. Add route to App.jsx:
```jsx
import NewPage from "@/pages/NewPage";

// In Routes component:
<Route path="/new-page" element={<NewPage />} />
```

#### Use UI Components

```jsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

function MyComponent() {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: "Success!",
      description: "Your action was completed.",
    });
  };

  return (
    <div>
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="Enter email" />
      <Button onClick={handleClick}>Submit</Button>
    </div>
  );
}
```

#### Use Magic UI Animations

```jsx
import { FadeIn } from "@/components/magicui/fade-in";
import { GradientText } from "@/components/magicui/gradient-text";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

function AnimatedComponent() {
  return (
    <>
      <FadeIn direction="up" delay={0.2}>
        <h1><GradientText>Animated Title</GradientText></h1>
      </FadeIn>

      <FadeIn direction="left" delay={0.4}>
        <ShimmerButton>Click Me</ShimmerButton>
      </FadeIn>
    </>
  );
}
```

#### Make API Calls

```jsx
import { cryptoAPI } from "@/services/api";
import { useFetch } from "@/hooks/useFetch";

function CryptoList() {
  const { data, loading, error, refetch } = useFetch(
    () => cryptoAPI.getCryptos()
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {data.map(crypto => (
        <div key={crypto.id}>{crypto.name}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

## Available Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## Project Structure Quick Reference

```
src/
├── components/
│   ├── ui/          # Import from "@/components/ui/button"
│   ├── magicui/     # Import from "@/components/magicui/fade-in"
│   └── layout/      # Import from "@/components/layout/Navbar"
├── pages/           # Import from "@/pages/Home"
├── services/        # Import from "@/services/api"
├── hooks/           # Import from "@/hooks/useLocalStorage"
├── utils/           # Import from "@/utils/formatters"
└── lib/             # Import from "@/lib/utils"
```

## Common Patterns

### Form with Validation
```jsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

function MyForm() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate and submit
    toast({ title: "Success!", description: "Form submitted" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Modal Dialog
```jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function MyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        <div>Dialog content goes here</div>
      </DialogContent>
    </Dialog>
  );
}
```

### Tabbed Interface
```jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function MyTabs() {
  return (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
    </Tabs>
  );
}
```

## Styling Tips

### Custom Colors
Add to `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      'brand': {
        50: '#f0f9ff',
        // ... add more shades
      }
    }
  }
}
```

### Dark Mode
Components automatically support dark mode via CSS variables in `index.css`.

### Responsive Design
Use Tailwind's responsive prefixes:
```jsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

## Environment Variables

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Cryptalyst.ai
```

Access in code:
```js
const apiUrl = import.meta.env.VITE_API_URL;
```

## Resources

- **ShadCN UI Docs**: https://ui.shadcn.com/
- **Radix UI Docs**: https://www.radix-ui.com/
- **TailwindCSS Docs**: https://tailwindcss.com/
- **Framer Motion Docs**: https://www.framer.com/motion/
- **React Router Docs**: https://reactrouter.com/

## Support

For issues or questions:
1. Check `README.md` for detailed documentation
2. Review `SETUP_COMPLETE.md` for full feature list
3. Inspect existing components for examples

Happy coding!

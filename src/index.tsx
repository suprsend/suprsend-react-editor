import { Button } from '@/components/ui/button';
import './index.css';

export function MyButton() {
  return (
    <div className="suprsend-flex suprsend-min-h-svh suprsend-flex-col suprsend-items-center suprsend-justify-center">
      <h1 className="suprsend-text-3xl suprsend-font-bold suprsend-underline suprsend-bg-red-600">
        Hello World
      </h1>
      <Button>Click me default</Button>
    </div>
  );
}

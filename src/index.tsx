import { Button } from '@/components/Button';
import './index.css';

export function MyButton() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <h1 className="text-3xl font-bold underline bg-red-600">Hello World</h1>
      <Button>Click me default</Button>
    </div>
  );
}

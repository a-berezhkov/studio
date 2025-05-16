
"use client";

import { Laptop } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface ViewCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  laptop: Laptop | null;
}

export function ViewCredentialsDialog({ open, onOpenChange, laptop }: ViewCredentialsDialogProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (!laptop) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>Учетные данные ноутбука: {laptop.login}</DialogTitle>
          <DialogDescription>
            Учетные данные для выбранного ноутбука.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="login" className="text-right">
              Логин
            </Label>
            <Input id="login" value={laptop.login} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Пароль
            </Label>
            <div className="col-span-3 relative">
              <Input id="password" type={showPassword ? "text" : "password"} value={laptop.password || "Н/Д"} readOnly />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

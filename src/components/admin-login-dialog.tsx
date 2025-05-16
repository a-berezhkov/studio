
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";

interface AdminLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (login: string, password_param: string) => void;
}

export function AdminLoginDialog({ open, onOpenChange, onLogin }: AdminLoginDialogProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginAttempt = () => {
    onLogin(login, password);
    // Dialog close is handled by parent based on login success
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>Вход для администратора</DialogTitle>
          <DialogDescription>
            Введите учетные данные администратора для управления приложением.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="admin-login-username" className="text-right">
              Имя пользователя
            </Label>
            <Input
              id="admin-login-username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="col-span-3"
              placeholder="admin"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="admin-login-password" className="text-right">
              Пароль
            </Label>
            <Input
              id="admin-login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
              placeholder="password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleLoginAttempt}>
            <LogIn className="mr-2 h-4 w-4" /> Войти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

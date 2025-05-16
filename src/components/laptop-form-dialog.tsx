
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Laptop } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

const getLaptopFormSchema = (isEditing: boolean) => z.object({
  login: z.string().min(1, { message: "Логин обязателен." }),
  password: isEditing 
    ? z.string().optional() 
    : z.string().min(1, { message: "Пароль обязателен." }), 
});


type LaptopFormValues = {
  login: string;
  password?: string; 
};

interface LaptopFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LaptopFormValues, laptopId?: string) => void;
  initialData?: Laptop;
}

export function LaptopFormDialog({ open, onOpenChange, onSubmit, initialData }: LaptopFormDialogProps) {
  const form = useForm<LaptopFormValues>({
    resolver: zodResolver(getLaptopFormSchema(!!initialData)),
    defaultValues: initialData ? { login: initialData.login, password: initialData.password || "" } : { login: "", password: "" },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({ login: initialData.login, password: initialData.password || "" });
      } else {
        form.reset({ login: "", password: "" });
      }
    }
  }, [initialData, form, open]);


  const handleSubmit = (data: LaptopFormValues) => {
    onSubmit(data, initialData?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>{initialData ? "Редактировать ноутбук" : "Добавить новый ноутбук"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Обновите данные этого ноутбука. Оставьте пароль пустым, чтобы сохранить текущий." : "Введите логин и пароль для нового ноутбука."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="login"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Логин/ID</FormLabel>
                  <FormControl>
                    <Input placeholder="например, Ноутбук01, ИнвНомер123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={initialData ? "Оставьте пустым, чтобы сохранить текущий" : "Введите пароль"} 
                      {...field} 
                      value={field.value ?? ""} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
              <Button type="submit">{initialData ? "Сохранить изменения" : "Добавить ноутбук"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

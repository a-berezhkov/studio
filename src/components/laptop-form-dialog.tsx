
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Laptop, Room } from "@/lib/types";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";

const getLaptopFormSchema = (isEditing: boolean, isRoomSelectionRequired: boolean) => z.object({
  login: z.string().min(1, { message: "Логин обязателен." }),
  password: isEditing 
    ? z.string().optional() 
    : z.string().min(1, { message: "Пароль обязателен." }),
  roomId: isRoomSelectionRequired
    ? z.string().min(1, { message: "Кабинет обязателен для нового ноутбука." })
    : z.string().optional(),
});


type LaptopFormValues = {
  login: string;
  password?: string;
  roomId?: string;
};

interface LaptopFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { login: string; password?: string; roomId: string; }, laptopId?: string) => void;
  initialData?: Laptop;
  availableRooms?: Room[];
  fixedRoomId?: string; // If provided, this room is used and no selection is shown.
}

export function LaptopFormDialog({ 
    open, 
    onOpenChange, 
    onSubmit, 
    initialData, 
    availableRooms,
    fixedRoomId 
}: LaptopFormDialogProps) {
  const isEditing = !!initialData;
  const showRoomSelect = !isEditing && !!availableRooms && !fixedRoomId && availableRooms.length > 0;
  const isRoomSelectionRequiredInSchema = !isEditing && !fixedRoomId && !!availableRooms && availableRooms.length > 0;

  const form = useForm<LaptopFormValues>({
    resolver: zodResolver(getLaptopFormSchema(isEditing, isRoomSelectionRequiredInSchema)),
    defaultValues: initialData 
      ? { login: initialData.login, password: initialData.password || "", roomId: initialData.roomId } 
      : { login: "", password: "", roomId: fixedRoomId || availableRooms?.[0]?.id || "" },
  });

  useEffect(() => {
    if (open) {
      const defaultRoom = fixedRoomId || availableRooms?.[0]?.id || "";
      if (initialData) {
        form.reset({ login: initialData.login, password: initialData.password || "", roomId: initialData.roomId });
      } else {
        form.reset({ login: "", password: "", roomId: defaultRoom });
      }
    }
  }, [initialData, form, open, availableRooms, fixedRoomId]);


  const handleSubmit = (data: LaptopFormValues) => {
    let finalRoomId: string;

    if (isEditing) {
      finalRoomId = initialData!.roomId; // Room doesn't change on edit through this dialog
    } else {
      finalRoomId = fixedRoomId || data.roomId!;
    }
    
    if (!finalRoomId && !isEditing) {
        // This should ideally be caught by Zod validation if isRoomSelectionRequiredInSchema is true
        form.setError("roomId", { type: "manual", message: "Кабинет не был определен."});
        return;
    }

    onSubmit({ login: data.login, password: data.password, roomId: finalRoomId }, initialData?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>{initialData ? "Редактировать ноутбук" : "Добавить новый ноутбук"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Обновите данные этого ноутбука. Оставьте пароль пустым, чтобы сохранить текущий." : "Введите логин, пароль и выберите кабинет для нового ноутбука."}
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
            {showRoomSelect && (
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Кабинет</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите кабинет" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRooms?.map(room => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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

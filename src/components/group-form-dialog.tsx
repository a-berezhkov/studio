
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Group } from "@/lib/types";
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

const groupFormSchema = z.object({
  name: z.string().min(1, { message: "Название группы обязательно." }),
});

type GroupFormValues = z.infer<typeof groupFormSchema>;

interface GroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GroupFormValues, groupId?: string) => void;
  initialData?: Group;
}

export function GroupFormDialog({ open, onOpenChange, onSubmit, initialData }: GroupFormDialogProps) {
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: initialData || { name: "" },
  });

 useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset(initialData);
      } else {
        form.reset({ name: "" });
      }
    }
  }, [initialData, form, open]);

  const handleSubmit = (data: GroupFormValues) => {
    onSubmit(data, initialData?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>{initialData ? "Редактировать группу" : "Добавить новую группу"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Обновите название группы." : "Введите название для новой группы."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название группы</FormLabel>
                  <FormControl>
                    <Input placeholder="например, Утренний класс, Продвинутая группа" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
              <Button type="submit">{initialData ? "Сохранить изменения" : "Добавить группу"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

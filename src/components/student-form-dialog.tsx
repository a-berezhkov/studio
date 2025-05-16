
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Student, Group } from "@/lib/types";
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

const studentFormSchema = z.object({
  name: z.string().min(1, { message: "Имя учащегося обязательно." }),
  groupId: z.string().min(1, { message: "Группа обязательна." }),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StudentFormValues, studentId?: string) => void;
  initialData?: Student;
  groups: Group[]; 
}

export function StudentFormDialog({ open, onOpenChange, onSubmit, initialData, groups }: StudentFormDialogProps) {
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: initialData ? { name: initialData.name, groupId: initialData.groupId } : { name: "", groupId: groups[0]?.id || "" },
  });

 useEffect(() => {
    if (open) {
        if (initialData) {
          form.reset({ name: initialData.name, groupId: initialData.groupId });
        } else {
          form.reset({ name: "", groupId: groups[0]?.id || "" });
        }
    }
  }, [initialData, groups, form, open]);

  const handleSubmit = (data: StudentFormValues) => {
    onSubmit(data, initialData?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>{initialData ? "Редактировать учащегося" : "Добавить нового учащегося"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Обновите данные учащегося и его группу." : "Введите имя и назначьте группу для нового учащегося."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Полное имя</FormLabel>
                  <FormControl>
                    <Input placeholder="например, Иван Иванов" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Группа</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger disabled={groups.length === 0}>
                        <SelectValue placeholder="Выберите группу" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.length === 0 && <SelectItem value="" disabled>Нет доступных групп. Пожалуйста, сначала добавьте группу.</SelectItem>}
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
              <Button type="submit" disabled={groups.length === 0}>{initialData ? "Сохранить изменения" : "Добавить учащегося"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateSolarUnitMutation, useGetUnassignedUsersQuery } from "@/lib/redux/query"
import { useNavigate } from "react-router"

const formSchema = z.object({
    serialNumber: z.string().min(1, { message: "Serial number is required" }),
    installationDate: z.string().min(1, { message: "Installation date is required" }),
    capacity: z.number().positive({ message: "Capacity must be a positive number" }),
    status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"], { message: "Please select a valid status" }),
    userId: z.string().optional(),
});

export function CreateSolarUnitForm() {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userId: "",
        },
    })

    const navigate = useNavigate();
    const [createSolarUnit, { isLoading: isCreatingSolarUnit }] = useCreateSolarUnitMutation();
    const { data: unassignedUsers, isLoading: isLoadingUsers } = useGetUnassignedUsersQuery();

    async function onSubmit(values) {
        try {
            // Remove userId if empty (not selected)
            const data = { ...values };
            if (!data.userId) {
                delete data.userId;
            }
            await createSolarUnit(data).unwrap();
            navigate("/admin/solar-units");
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Serial Number</FormLabel>
                            <FormControl>
                                <Input placeholder="Serial Number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="installationDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Installation Date</FormLabel>
                            <FormControl>
                                <Input type="date" placeholder="Installation Date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Capacity (Watts)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Capacity" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription>Enter capacity in Watts (e.g. 5000 for 5kW)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                                <Select value={field.value || ""} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Assign to User (Optional)</FormLabel>
                            <FormControl>
                                <Select value={field.value || ""} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user to assign" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isLoadingUsers ? (
                                            <SelectItem value="__loading" disabled>Loading users...</SelectItem>
                                        ) : unassignedUsers?.length === 0 ? (
                                            <SelectItem value="__empty" disabled>No unassigned users available</SelectItem>
                                        ) : (
                                            unassignedUsers?.map((user) => (
                                                <SelectItem key={user._id} value={user._id}>
                                                    {user.email}{user.firstName ? ` (${user.firstName} ${user.lastName || ''})` : ''}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormDescription>You can assign a user now or later from the solar unit detail page</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isCreatingSolarUnit}>{isCreatingSolarUnit ? "Creating..." : "Create"}</Button>
            </form>
        </Form>
    );
}
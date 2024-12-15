import { motion } from "framer-motion"
import { Input } from "../../ui/Input"
import { Label } from "../../ui/Label"
import Button from "../../ui/Button"
import { useEffect, useState } from "react"
import { TaskSchema, type TaskSchemaType } from "../../app/task/types"
import { zodErrorToString } from "../../utils/handleZodError"
import { toast } from "sonner"
import Toggle from "../../ui/Toggle"
import { SquarePlus } from "lucide-react"
import DateTime from "../../ui/DateTime"
import type { Dayjs } from "dayjs"
import type { FetchResponseError } from "../../utils/api"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../../app/store"
import { createNewTask, selectTaskById, getSingleTask } from "../../app/task/taskSlice"
import { useNavigate, useParams } from "react-router"
import LoLoadingSpinner from "../../ui/LoLoadingSpinner"
import dayjs from "dayjs"

const EditTask = () => {
    const dispatch: AppDispatch = useDispatch()
    const navigate = useNavigate();
    const [task, setTask] = useState<TaskSchemaType>({ title: '', priority: 1, taskStatus: 'Pending', startTime: '', endTime: '' });
    const [loading, setLoading] = useState<boolean>(false);
    const [editLoading, setEditLoading] = useState<boolean>(false);

    const { taskId } = useParams<{ taskId: string }>();

    const singleTask = useSelector((state: RootState) => selectTaskById(state, Number(taskId)))

    useEffect(() => {
        async function fetchData() {
            if (taskId === undefined) {
                setLoading(false)
                return;
            }
            try {
                if (singleTask === undefined) {
                    await dispatch(getSingleTask(taskId)).unwrap();
                }
            } catch (err) {
                const errorMessage =
                    (err as FetchResponseError).message ||
                    'An error occurred while fetching data';
                toast.error(errorMessage);
            }
        }
        fetchData().then(() => setLoading(false))
    }, [dispatch, taskId, singleTask])

    useEffect(() => {
        console.log(singleTask);
        if (singleTask) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...taskWOID } = singleTask;
            setTask(taskWOID)
        }
    }, [singleTask])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = TaskSchema.safeParse(task)
        if (isValid.success) {
            console.log(isValid.data)
            setEditLoading(true);
            try {
                await dispatch(createNewTask(isValid.data)).unwrap();
                toast.success('Task Editted');
                navigate('/tasklist')
            } catch (err) {
                const errorMessage =
                    (err as FetchResponseError).message ||
                    'An error occurred editing task.';
                toast.error(errorMessage);
            } finally {
                setEditLoading(false);
            }
        } else {
            const errorMessages = zodErrorToString(isValid.error)
            toast.error(`Validation errors: ${errorMessages}`);
        }
    };

    const handleDateTimeChange = (startDateTime: Dayjs | null, endDateTime: Dayjs | null) => {
        if (startDateTime && endDateTime) {
            setTask({
                ...task,
                startTime: startDateTime.format('YYYY-MM-DD HH:mm:ss'),
                endTime: endDateTime.format('YYYY-MM-DD HH:mm:ss')
            });
        }
    }

    return !loading ? (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
        >
            <div className="flex mt-20 items-center justify-center text-black">
                <div className="flex items-center justify-center">
                    <div className="w-[30rem] overflow-hidden rounded-2xl border-y border-gray-200 sm:border sm:shadow-xl">
                        <div className="bg-whitish flex flex-col justify-center space-y-3 border-b border-gray-200 px-4 py-6 pt-8 sm:px-10">
                            <div className={'space-y-1'}>
                                <h3 className="text-xl font-semibold tracking-wide">
                                    Edit Task
                                </h3>
                                <p className="text-sm tracking-wide text-gray-500">
                                    Task ID: {taskId}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-3 bg-gray-50 px-4 py-8 sm:px-10">
                            <form onSubmit={handleSubmit} className='space-y-5'>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title" type="text" name="title" value={task.title} required onChange={(e) => setTask({ ...task, title: e.target.value })} />
                                </div>
                                <div className="flex items-center justify-between w-full">
                                    <div className="w-1/3 space-y-2">
                                        <Label htmlFor="priority">Priority</Label>
                                        <Input id="priority" type="number" name="priority" min={1} max={5} value={task.priority} required onChange={(e) => setTask({ ...task, priority: +e.target.value })} />
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <Label htmlFor="switch-component-on">Status</Label>
                                        <Toggle checked={task.taskStatus === "Finished" ? true : false} onChange={() => setTask({ ...task, taskStatus: task.taskStatus === 'Pending' ? 'Finished' : 'Pending' })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <DateTime initialStartDate={dayjs(task.startTime)} initialEndDate={dayjs(task.endTime)} onDateTimeChange={handleDateTimeChange} />
                                </div>
                                <div className="flex space-x-3 pt-5">
                                    <Button
                                        type={'button'}
                                        variant={'secondary'}
                                        text={'cancel'}
                                        className='h-10'
                                        onClick={() => navigate('/tasklist')}
                                    />
                                    <Button
                                        type={'submit'}
                                        variant={'secondary'}
                                        text={'Add Task'}
                                        className='h-10'
                                        icon={<SquarePlus className={'h-4 w-4'} />}
                                        loading={editLoading}
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    ) : (
        <LoLoadingSpinner />
    )
}

export default EditTask
import express, { Request, Response } from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';

const app = express();
const PORT = 3000;

// Типы для задач
type TaskCategory = 'Bug' | 'Feature' | 'Documentation' | 'Refactor' | 'Test';
type TaskStatus = 'To Do' | 'In Progress' | 'Done';
type TaskPriority = 'Low' | 'Medium' | 'High';

interface Task {
	id: string;
	title: string;
	description?: string;
	category: TaskCategory;
	status: TaskStatus;
	priority: TaskPriority;
	createdAt: string;
}

// Middleware
app.use(cors());
app.use(express.json());

// Данные в памяти
let tasks: Task[] = [
	{
		id: '1',
		title: 'Fix UI glitches',
		description: 'Resolve layout shift issues on the dashboard when switching themes.',
		category: 'Bug',
		status: 'To Do',
		priority: 'Low',
		createdAt: '2025-07-15T09:00:00Z'
	},
	{
		id: '2',
		title: 'Add unit tests',
		description: 'Cover edge cases for the authentication module.',
		category: 'Feature',
		status: 'To Do',
		priority: 'High',
		createdAt: '2025-07-16T10:30:00Z'
	},
	{
		id: '4',
		title: 'Refactor auth middleware',
		description: 'Improve code readability and separate concerns for easier testing.',
		category: 'Refactor',
		status: 'Done',
		priority: 'Medium',
		createdAt: '2025-07-12T08:20:00Z'
	},
	{
		id: '5',
		title: 'Fix login redirect bug',
		description: 'Users are not redirected properly after logging in.',
		category: 'Bug',
		status: 'In Progress',
		priority: 'Medium',
		createdAt: '2025-07-17T11:10:00Z'
	},
	{
		id: '7',
		title: 'Document CLI usage',
		description: 'Write user-facing documentation for the new CLI tool.',
		category: 'Documentation',
		status: 'Done',
		priority: 'Medium',
		createdAt: '2025-07-10T15:40:00Z'
	}
];

// Главная страница - информация о сервере
app.get('/', (req: Request, res: Response) => {
	res.json({
		message: 'Task Management Server работает!',
		endpoints: {
			'GET /tasks': 'Получить все задачи',
			'GET /tasks/:id': 'Получить задачу по ID',
			'POST /tasks': 'Создать задачу',
			'PATCH /tasks/:id': 'Обновить задачу',
			'DELETE /tasks/:id': 'Удалить задачу'
		}
	});
});

// GET /tasks - получить все задачи
app.get('/tasks', (req: Request, res: Response) => {
	const { title, date } = req.query;
	let result: Task[] = [...tasks];

	// Поиск по названию
	if (title && typeof title === 'string') {
		result = result.filter((task) => task.title.toLowerCase().includes(title.toLowerCase()));
	}

	// Поиск по дате
	if (date && typeof date === 'string') {
		result = result.filter((task) => task.createdAt.startsWith(date));
	}

	res.json(result);
});

// GET /tasks/:id - получить задачу по ID
app.get('/tasks/:id', (req: Request, res: Response) => {
	const { id } = req.params;
	const task = tasks.find((t) => t.id === id);

	if (!task) {
		return res.status(404).json({ error: 'Задача не найдена' });
	}

	res.json(task);
});

// POST /tasks - создать новую задачу
app.post('/tasks', (req: Request, res: Response) => {
	const { title, description, category, status, priority }: Partial<Task> = req.body;

	if (!title || !title.trim()) {
		return res.status(400).json({ error: 'Название задачи обязательно' });
	}

	if (!category || !status || !priority) {
		return res.status(400).json({
			error: 'Категория, статус и приоритет обязательны'
		});
	}

	const newTask: Task = {
		id: nanoid(),
		title: title.trim(),
		description: description || '',
		category,
		status,
		priority,
		createdAt: new Date().toISOString()
	};

	tasks.push(newTask);
	res.status(201).json(newTask);
});

// PATCH /tasks/:id - обновить задачу
app.patch('/tasks/:id', (req: Request, res: Response) => {
	const { id } = req.params;
	const updates: Partial<Task> = req.body;

	const taskIndex = tasks.findIndex((t) => t.id === id);

	if (taskIndex === -1) {
		return res.status(404).json({ error: 'Задача не найдена' });
	}

	// Проверяем title если он передан
	if (updates.title !== undefined && !updates.title.trim()) {
		return res.status(400).json({ error: 'Название не может быть пустым' });
	}

	// Обновляем задачу
	tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
	res.json(tasks[taskIndex]);
});

// DELETE /tasks/:id - удалить задачу
app.delete('/tasks/:id', (req: Request, res: Response) => {
	const { id } = req.params;
	const taskIndex = tasks.findIndex((t) => t.id === id);

	if (taskIndex === -1) {
		return res.status(404).json({ error: 'Задача не найдена' });
	}

	tasks.splice(taskIndex, 1);
	res.status(204).send();
});

// Обработка несуществующих маршрутов
app.use('*', (res: Response) => {
	res.status(404).json({ error: 'Маршрут не найден' });
});

// Запуск сервера
app.listen(PORT, () => {
	console.log(`Сервер запущен на http://localhost:${PORT}`);
});

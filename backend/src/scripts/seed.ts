import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import { prisma } from '../lib/prisma.js';
import { AttendanceStatuses, PerformanceCategories } from '../types/domain.js';

const membersSeed = [
  {
    vin: 'VIN-001',
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: 'aarav.sharma@nmims.edu',
    phone: '+91-9000000001',
    department: 'Mechanical',
    batch: '2022',
    joinDate: new Date('2022-08-01'),
    status: 'Active',
    position: 'Club Captain',
    skills: 'Mechanical design, Leadership, Strategy',
    notes: 'Focuses on weekly leadership sync.',
  },
  {
    vin: 'VIN-002',
    firstName: 'Ishita',
    lastName: 'Rao',
    email: 'ishita.rao@nmims.edu',
    phone: '+91-9000000002',
    department: 'Electronics',
    batch: '2023',
    joinDate: new Date('2023-01-10'),
    status: 'Core',
    position: 'Electronics Lead',
    skills: 'Circuit design, Soldering, PCB layout',
    notes: 'Mentors juniors on soldering best practices.',
  },
  {
    vin: 'VIN-003',
    firstName: 'Kabir',
    lastName: 'Patel',
    email: 'kabir.patel@nmims.edu',
    phone: '+91-9000000003',
    department: 'Programming',
    batch: '2021',
    joinDate: new Date('2021-07-18'),
    status: 'Active',
    position: 'Software Specialist',
    skills: 'ROS, Python, Vision systems',
    notes: 'Owns AI navigation module.',
  },
  {
    vin: 'VIN-004',
    firstName: 'Maya',
    lastName: 'Desai',
    email: 'maya.desai@nmims.edu',
    phone: '+91-9000000004',
    department: 'Design',
    batch: '2022',
    joinDate: new Date('2022-09-03'),
    status: 'Active',
    position: 'Design Strategist',
    skills: 'CAD, Simulation, UX storytelling',
    notes: 'Handles design reviews and documentation.',
  },
  {
    vin: 'VIN-005',
    firstName: 'Rohan',
    lastName: 'Menon',
    email: 'rohan.menon@nmims.edu',
    phone: '+91-9000000005',
    department: 'Mechanical',
    batch: '2024',
    joinDate: new Date('2024-01-11'),
    status: 'Trainee',
    position: 'Junior Prototyper',
    skills: '3D printing, Material testing',
    notes: 'Recently joined training program.',
  },
];

const performanceSeed = [
  {
    memberVin: 'VIN-001',
    category: 'MECHANICAL',
    score: 88,
    rating: 9,
    notes: 'Led drivetrain redesign sprint.',
  },
  {
    memberVin: 'VIN-002',
    category: 'ELECTRONICS',
    score: 82,
    rating: 8,
    notes: 'Delivered stable PCB prototypes.',
  },
  {
    memberVin: 'VIN-003',
    category: 'PROGRAMMING',
    score: 91,
    rating: 10,
    notes: 'Optimised control algorithms.',
  },
  {
    memberVin: 'VIN-004',
    category: 'DESIGN',
    score: 79,
    rating: 8,
    notes: 'Created match-ready design collaterals.',
  },
];

const seed = async () => {
  await prisma.attendanceRecord.deleteMany();
  await prisma.performanceRecord.deleteMany();
  await prisma.user.deleteMany();
  await prisma.member.deleteMany();

  type MemberEntity = Awaited<ReturnType<typeof prisma.member.create>>;

  const members = (await prisma.$transaction(
    membersSeed.map((member) =>
      prisma.member.create({
        data: member,
      }),
    ),
  )) as MemberEntity[];

  const memberByVin = new Map<string, MemberEntity>(members.map((member) => [member.vin, member]));

  const password = await bcrypt.hash('vinyasa@123', 10);

  await prisma.user.createMany({
    data: [
      {
        email: 'admin@vinyasa.club',
        passwordHash: password,
        role: 'ADMIN',
        memberId: memberByVin.get('VIN-001')?.id,
      },
      {
        email: 'instructor@vinyasa.club',
        passwordHash: password,
        role: 'INSTRUCTOR',
        memberId: memberByVin.get('VIN-002')?.id,
      },
      {
        email: 'member@vinyasa.club',
        passwordHash: password,
        role: 'MEMBER',
        memberId: memberByVin.get('VIN-003')?.id,
      },
    ],
  });

  const attendanceDays = Array.from({ length: 10 }, (_, index) =>
    dayjs().subtract(index, 'day').startOf('day'),
  );

  const attendanceRecords = [];
  for (const member of members) {
    for (const day of attendanceDays) {
      const status =
        member.status === 'Trainee' && Math.random() > 0.7
          ? 'EXCUSED'
          : AttendanceStatuses[Math.floor(Math.random() * AttendanceStatuses.length)];
      attendanceRecords.push({
        memberId: member.id,
        date: day.toDate(),
        status,
        notes: status === 'LATE' ? 'Arrived 10 mins late' : undefined,
      });
    }
  }

  await prisma.attendanceRecord.createMany({
    data: attendanceRecords,
  });

  await prisma.$transaction(
    performanceSeed.map((record) =>
      prisma.performanceRecord.create({
        data: {
          category: record.category,
          score: record.score,
          rating: record.rating,
          notes: record.notes,
          memberId: memberByVin.get(record.memberVin)?.id ?? members[0].id,
        },
      }),
    ),
  );
};

seed()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Database seeded successfully.');
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Seeding failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

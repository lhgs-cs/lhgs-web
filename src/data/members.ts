// 社员数据（唯一数据源）
// 由原 js/members-data.js 迁移而来，字段与顺序保持一致。

export interface MemberSubgroup {
  id: string;
  role: string;
}

export interface Member {
  name: string;
  avatar: string;
  bio: string;
  subgroups: MemberSubgroup[];
}

export const members: Member[] = [
  {
    name: '老魏',
    avatar: '/images/members/wei.jpeg',
    bio: '公社社长、硬算社社长',
    subgroups: [
      { id: 'yingsuan', role: '社长' },
      { id: 'cs', role: '社员' },
    ],
  },
  {
    name: '向死而生',
    avatar: '/images/members/xses.jpeg',
    bio: '公社常务委员会委员长、朗诵社社长、宣传委员会委员长',
    subgroups: [{ id: 'langsong', role: '社长' }],
  },
  {
    name: '光明与尘埃',
    avatar: '/images/members/gmyca.jpeg',
    bio: '计算机科学社社长、官网搭建与维护者',
    subgroups: [
      { id: 'cs', role: '社长' },
      { id: 'langsong', role: '社员' },
    ],
  },
  {
    name: 'C0',
    avatar: '/images/members/C0.jpg',
    bio: '计算机科学社社员、官网优化与维护者',
    subgroups: [
      { id: 'cs', role: '社员' },
      { id: 'yingsuan', role: '社员' },
    ],
  },
  {
    name: 'qian',
    avatar: '/images/members/qian.jpeg',
    bio: '联合公社二办事处处长和文件编写员，朗诵社社员',
    subgroups: [{ id: 'langsong', role: '社员' }],
  },
  {
    name: '奥尔良公爵',
    avatar: '/images/members/zhu.jpeg',
    bio: '',
    subgroups: [{ id: 'cs', role: '社员' }],
  },
  {
    name: 'MTHR',
    avatar: '/images/members/mthr.jpeg',
    bio: '',
    subgroups: [{ id: 'yingsuan', role: '社员' }],
  },
  {
    name: '徐',
    avatar: '/images/members/xu.jpeg',
    bio: '',
    subgroups: [{ id: 'yingsuan', role: '社员' }],
  },
  {
    name: '柳',
    avatar: '/images/members/liu.jpeg',
    bio: '',
    subgroups: [{ id: 'yingsuan', role: '社员' }],
  },
  {
    name: '陈',
    avatar: '/images/members/chen.jpeg',
    bio: '',
    subgroups: [{ id: 'yingsuan', role: '社员' }],
  },
  {
    name: '周',
    avatar: '/images/members/zhou.jpeg',
    bio: '',
    subgroups: [{ id: 'langsong', role: '社员' }],
  },
];

/** 取某位成员在指定分社中的角色，没有则返回空字符串 */
export function roleOf(member: Member, subgroupId: string): string {
  return member.subgroups.find((s) => s.id === subgroupId)?.role ?? '';
}

/** 取某分社的成员，社长排在最前 */
export function membersOf(subgroupId: string): Member[] {
  return members
    .filter((m) => roleOf(m, subgroupId) !== '')
    .sort((a, b) => (roleOf(b, subgroupId) === '社长' ? 1 : 0) - (roleOf(a, subgroupId) === '社长' ? 1 : 0));
}

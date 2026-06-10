import { z } from 'zod';

const RESERVED_NICKNAMES = [
  'system',
  'admin',
  'administrator',
  'root',
  'support',
  'official',

  '관리자',
  '운영자',
  '운영팀',
  '고객센터',
  '공식',
  '시스템',
];

const BAD_WORDS = [
  '시발',
  '씨발',
  '병신',
  '개새끼',
  '좆',
  '존나',
  '지랄',
  '꺼져',
  'fuck',
  'shit',
  'bitch',
];

export const signupSchema = z.object({
  email: z.email({
    message: '올바른 이메일 형식이 아닙니다.',
  }),

  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .regex(/[A-Z]/, '비밀번호는 대문자를 1개 이상 포함해야 합니다.')
    .regex(/[^A-Za-z0-9]/, '비밀번호는 특수문자를 1개 이상 포함해야 합니다.'),

  nickname: z
    .string()
    .trim()
    .min(2, '닉네임은 2자 이상이어야 합니다.')
    .max(10, '닉네임은 10자 이하여야 합니다.')

    .refine(
      (value) => !/^[ㄱ-ㅎㅏ-ㅣ]+$/.test(value),
      '닉네임은 완성된 문자로 입력해주세요.',
    )

    .refine(
      (value) => !/\s/.test(value),
      '닉네임에는 공백을 사용할 수 없습니다.',
    )

    .refine(
      (value) => !RESERVED_NICKNAMES.includes(value.toLowerCase()),
      '사용할 수 없는 닉네임입니다.',
    )

    // 연속 특수문자 차단
    .refine(
      (value) => !/[-_]{2,}/.test(value),
      '특수문자는 연속해서 사용할 수 없습니다.',
    )

    // 시작/끝 특수문자 차단
    .refine(
      (value) => !/^[-_]|[-_]$/.test(value),
      '닉네임은 특수문자로 시작하거나 끝날 수 없습니다.',
    )

    // 욕설 필터
    .refine(
      (value) =>
        !BAD_WORDS.some((word) =>
          value.toLowerCase().includes(word.toLowerCase()),
        ),
      '사용할 수 없는 닉네임입니다.',
    )

    .regex(
      /^[가-힣a-zA-Z0-9_-]+$/,
      '닉네임은 한글, 영문, 숫자, -, _ 만 사용할 수 있습니다.',
    ),
});

export const loginSchema = z.object({
  email: z.preprocess(
    (value) => value ?? '',
    z
      .string()
      .trim()
      .min(1, { message: '이메일을 입력해주세요.' })
      .pipe(
        z.email({
          message: '올바른 이메일 형식이 아닙니다.',
        }),
      ),
  ),

  password: z.preprocess(
    (value) => value ?? '',
    z.string().min(1, {
      message: '비밀번호를 입력해주세요.',
    }),
  ),
});

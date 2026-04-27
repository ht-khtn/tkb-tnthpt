-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.class_timetable (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  weekday text,
  period_no smallint,
  class_name text,
  subject_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT class_timetable_pkey PRIMARY KEY (id),
  CONSTRAINT class_timetable_class_name_fkey FOREIGN KEY (class_name) REFERENCES public.classes(name)
);
CREATE TABLE public.classes (
  name text NOT NULL,
  homeroom_teacher text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT classes_pkey PRIMARY KEY (name)
);
CREATE TABLE public.student_subjects (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  student_id integer,
  subject_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT student_subjects_pkey PRIMARY KEY (id),
  CONSTRAINT student_subjects_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT student_subjects_subject_fkey FOREIGN KEY (subject_name) REFERENCES public.subjects(name)
);
CREATE TABLE public.students (
  name text NOT NULL,
  class text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  id integer NOT NULL,
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_class_fkey FOREIGN KEY (class) REFERENCES public.classes(name)
);
CREATE TABLE public.subjects (
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subjects_pkey PRIMARY KEY (name)
);
CREATE TABLE public.thpt_timetable (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  weekday text,
  period_no smallint,
  location text,
  subject_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT thpt_timetable_pkey PRIMARY KEY (id),
  CONSTRAINT thpt_timetable_location_fkey FOREIGN KEY (location) REFERENCES public.classes(name),
  CONSTRAINT thpt_timetable_subject_name_fkey FOREIGN KEY (subject_name) REFERENCES public.subjects(name)
);
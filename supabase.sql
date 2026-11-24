-- Run this once in Supabase: SQL Editor > New query > paste > Run
create table events (
  id int primary key, name text not null, date text, place text,
  tiers jsonb not null  -- [["Regular",10000],["VIP",30000]]
);
create table orders (
  tx_ref text primary key,
  event_id int not null references events(id),
  tier text not null, qty int not null, amount int not null,
  phone text, status text not null default 'pending',
  created_at timestamptz default now()
);
create table tickets (
  code text primary key,
  tx_ref text not null references orders(tx_ref),
  event_id int not null, tier text not null,
  used boolean not null default false,
  created_at timestamptz default now()
);
-- Lock everything: only your server (service key) can read or write.
alter table events enable row level security;
alter table orders enable row level security;
alter table tickets enable row level security;

insert into events (id,name,date,place,tiers) values
(1,'Kigali Sunset Live','Sat 12 Dec 2026, 6:00 pm','Kigali Arena, Remera','[["Regular",10000],["VIP",30000]]'),
(2,'Laugh Out Loud Night','Fri 18 Dec 2026, 7:30 pm','Camp Kigali, Nyarugenge','[["Regular",5000],["VIP",15000]]'),
(3,'Derby Day: Gikundiro vs Rayon','Sun 20 Dec 2026, 3:00 pm','Amahoro Stadium','[["Stand",3000],["VIP",12000]]'),
(4,'Lake Kivu Beach Party','Sat 26 Dec 2026, 2:00 pm','Gisenyi, Rubavu','[["Regular",8000],["Table for 4",60000]]'),
(5,'Umuganda Street Market','Sat 2 Jan 2027, 9:00 am','Kimironko Market','[["Free entry",0]]'),
(6,'Intore Dance Festival','Fri 8 Jan 2027, 5:00 pm','Huye Cultural Centre','[["Regular",6000],["VIP",20000]]');

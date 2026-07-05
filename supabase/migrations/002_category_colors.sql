-- Phase 3 follow-up: the original seed (001) didn't set category colors.
-- Run this once in the Supabase SQL Editor if your categories still show grey chips.
update categories set color = '#c05621' where slug = 'kitchen' and color is null;
update categories set color = '#1d4ed8' where slug = 'tech'    and color is null;
update categories set color = '#15803d' where slug = 'home'    and color is null;
update categories set color = '#9333ea' where slug = 'beauty'  and color is null;
update categories set color = '#d97706' where slug = 'kids'    and color is null;
update categories set color = '#0f766e' where slug = 'fitness' and color is null;

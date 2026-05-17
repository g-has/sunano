-- Link store_products (loja + bazar) to peripherals via optional FK.
-- A peripheral may have at most one linked store-type product and one linked
-- bazaar-type product. The bazar/loja public pages join through this column
-- to show the corresponding item on the other surface.

alter table public.store_products
  add column if not exists peripheral_id uuid references public.peripherals(id) on delete set null;

create index if not exists store_products_peripheral_idx
  on public.store_products (peripheral_id);

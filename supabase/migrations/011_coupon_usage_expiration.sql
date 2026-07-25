create or replace function public.increment_coupon_usage(coupon_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_usage_limit integer;
  current_times_used integer;
begin
  select usage_limit, times_used
    into current_usage_limit, current_times_used
  from public.coupons
  where id = coupon_id;

  if not found then
    raise exception 'Coupon not found';
  end if;

  update public.coupons
  set
    times_used = current_times_used + 1,
    active = case
      when current_usage_limit > 0 and current_times_used + 1 >= current_usage_limit then false
      else active
    end
  where id = coupon_id;
end;
$$;

grant execute on function public.increment_coupon_usage(uuid) to authenticated, service_role;

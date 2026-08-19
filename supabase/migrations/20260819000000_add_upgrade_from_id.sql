-- 위시리스트 항목이 어떤 기존 구독을 교체하는지 저장한다.
-- docs/wishlist_feature_spec.md 의 upgrade_from_id 필드에 대응하며,
-- 이 컬럼이 없으면 교체 대상이 새로고침 시 유실되고 이름 유사도 추정으로 대체된다.
alter table public.subscriptions
  add column if not exists upgrade_from_id uuid
  references public.subscriptions (id) on delete set null;

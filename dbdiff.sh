# 0) Config
DBDIFF_SCHEMAS="${DBDIFF_SCHEMAS:-public,auth}"
DBDIFF_NEW="${DBDIFF_NEW:-db.dump.new.sql}"
DBDIFF_OLD="${DBDIFF_OLD:-db.dump.old.sql}"
DBDIFF_NEW_TEMP="${DBDIFF_NEW_TEMP:-${DBDIFF_NEW}.temp}"
DBDIFF_OLD_TEMP="${DBDIFF_OLD_TEMP:-${DBDIFF_OLD}.temp}"
DBDIFF_OUT="${DBDIFF_OUT:-db.dump.sql.diff}"

# 1) Ensure local stack is up and local DB reflects your repo migrations
npx supabase db start
npx supabase db reset --local

# 2) Dump **schema-only** from both sides (limit to your app schemas)
npx supabase db dump --local  --schema $DBDIFF_SCHEMAS > $DBDIFF_NEW_TEMP
npx supabase db dump --linked --schema $DBDIFF_SCHEMAS > $DBDIFF_OLD_TEMP

# 3) Normalize (strip volatile lines)
sed -E 's/[[:space:]]+$//' $DBDIFF_OLD_TEMP > $DBDIFF_OLD
sed -E 's/[[:space:]]+$//' $DBDIFF_NEW_TEMP > $DBDIFF_NEW

# 4) Diff
diff -u $DBDIFF_OLD $DBDIFF_NEW > $DBDIFF_OUT

# 5) Cleanup
rm $DBDIFF_OLD_TEMP $DBDIFF_NEW_TEMP

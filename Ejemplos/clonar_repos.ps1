$ErrorActionPreference = 'Continue'
$base = 'C:\Users\usuario\Desktop\Rastro Habitos\Ejemplos\repos'
$groups = [ordered]@{
  '01_rpg_gamificados_web' = @(
    'dohsimpson/HabitTrove',
    'lifeos-app/lifeos',
    'jofoerster/habitsync',
    'AndromedaTechnology/habitus',
    'E-Ecstacy/warrior-dashboard',
    'krwg/cultiva',
    'ARTESHMAN/habit-tracker',
    'Sp1r1tual/questanizer',
    'Zhang-yd1/daily-quest',
    'coralr-1/earth-online-quest',
    'MattCognac/life-rpg',
    'alexmita04/Hero-Quest',
    'ajstudd/momentum_ai',
    'Divyanshkumar62/Skill_Forge',
    'DavidZerox8/TaskMaster',
    'Captain-AJ/LIFE.EXE',
    'PhantomXReborn/IRL_SideQuest_Generator',
    'zhuyong1297-dev/life-rpg-pwa',
    'Vishaldubey2210/Life_RPG_OS',
    '5h4d0wn1k/productivity_game'
  )
  '02_estilo_solo_leveling_isekai' = @(
    'ankurrera/SoloLeveling',
    'asyhak/Solo-Leveling-Self-Improvement-App',
    'Deratheone/statuswindow',
    'MSrikanthkarthikeyan/aura-quest-grind',
    'Myamotto/solo-leveling-habit-tracker',
    'dhildeb/vitae-ascend-irl',
    'pughal-36/SoloLevelingTest'
  )
  '03_google_sheets' = @(
    'yashbhangale/discipline-tracker'
  )
  '04_trackers_habitos_referencia_ux' = @(
    'iSoron/uhabits',
    'daya0576/beaverhabits',
    'Vsein/Neohabit',
    'redpangilinan/iotawise',
    'dessalines/habit-maker',
    'tylxr59/Trakit',
    'Jinjinov/OpenHabitTracker',
    'oppiliappan/dijo'
  )
  '05_plugins_obsidian_y_otros' = @(
    'dromse/obsidian-gamified-tasks',
    'huyhungai/life-rpg-obsidian',
    'Ayagikei/LifeUp',
    'Idorobots/gamify-el'
  )
  '00_referente_habitica' = @(
    'HabitRPG/habitica'
  )
}
$log = @()
foreach ($g in $groups.Keys) {
  $dir = Join-Path $base $g
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  foreach ($repo in $groups[$g]) {
    $name = $repo.Replace('/', '__')
    $target = Join-Path $dir $name
    if (Test-Path $target) { $log += "SKIP $repo"; continue }
    git clone --depth 1 --quiet "https://github.com/$repo.git" "$target" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
      Remove-Item -Recurse -Force (Join-Path $target '.git') -ErrorAction SilentlyContinue
      $log += "OK   $g/$name"
    } else { $log += "FAIL $repo" }
    Write-Host $log[-1]
  }
}
$log | Out-File -Encoding utf8 "$base\_clone_log.txt"
Write-Host 'ALL DONE'

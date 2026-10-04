import { world, system, ItemStack } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';

const open = new Set(), held = new Set();
const preparing = new Set();
function enterLobby(player) {
  if (preparing.has(player.id)) return;
  if (player.hasTag('rh_home')) {
    if (!player.hasTag('rh_play')) command(player, 'home');
    return;
  }
  // This addon is a dedicated test-world experience, with a fixed arena.
  if (world.getAllPlayers().length > 1) {
    player.sendMessage('§7Initial lobby setup requires a singleplayer world.');
    return;
  }
  preparing.add(player.id);
  try {
    command(player, 'stop');
    player.runCommand('gamemode creative @s');
    player.runCommand('tp @s 24.5 98 24.5');
    player.sendMessage('§6Preparing Random Horror...');
    system.runTimeout(() => {
      try {
        if (!world.getAllPlayers().some(p => p.id === player.id)) return;
        command(player, 'lobby');
      } catch (error) { console.warn(`Random Horror lobby setup: ${error}`); }
      finally { preparing.delete(player.id); }
    }, 100);
  } catch (error) { preparing.delete(player.id); console.warn(`Random Horror entry: ${error}`); }
}
function command(player, name) {
  try { player.runCommand(`function rh/${name}`); }
  catch (error) { console.warn(`Random Horror: ${error}`); player.sendMessage('§cCould not complete the action. Please send the Content Log.'); }
}
function giveMenu(player) {
  const inventory = player.getComponent('minecraft:inventory')?.container;
  if (!inventory) return;
  for (let i = 0; i < inventory.size; i++) if (inventory.getItem(i)?.typeId === 'minecraft:compass') return;
  const item = new ItemStack('minecraft:compass');
  item.nameTag = '§6Random Horror Menu';
  item.setLore(['Select this compass, then sneak to open the menu.']);
  if (inventory.emptySlotsCount > 0) inventory.addItem(item);
}
async function menu(player) {
  if (open.has(player.id)) return;
  open.add(player.id);
  try {
    const playing = player.hasTag('rh_play');
    const form = new ActionFormData().title('Random Horror')
      .body(playing ? 'The dungeon keeps moving while this menu is open.' : 'A different labyrinth. A different nightmare.');
    if (playing) form.button('End round and return to lobby').button('Continue playing');
    else form.button('Play — random scenario').button('How to play').button('Close');
    const result = await form.show(player);
    if (result.canceled) return;
    if (playing) {
      if (result.selection === 0 && player.hasTag('rh_play')) command(player, 'stop');
    } else if (result.selection === 0 && player.hasTag('rh_home') && !player.hasTag('rh_play')) {
      if (world.getAllPlayers().some(p => p.id !== player.id && p.hasTag('rh_play'))) {
        player.sendMessage('§7This prototype supports one active player.');
      } else command(player, 'start');
    } else if (result.selection === 1) {
      player.sendMessage('§6Seals: §7hold each green tile 4s. §6Rescue: §7two key tiles, then free the captive and return. §6Ritual: §7hold runes 6s in order; 90s after the first. Gold floor is the exit. Select the compass and sneak to reopen this menu.');
    }
  } catch (error) { console.warn(`Random Horror menu: ${error}`); }
  finally { open.delete(player.id); }
}

// Physical lobby buttons are backed by script actions rather than command blocks.
world.beforeEvents.playerInteractWithBlock.subscribe(event => {
  const p = event.player, b = event.block;
  if (!p.hasTag('rh_home') || p.hasTag('rh_play')) return;
  if (b.location.y !== 91 || b.location.z !== 22) return;
  if (b.location.x !== 22 && b.location.x !== 26) return;
  event.cancel = true;
  system.run(() => {
    if (b.location.x === 22) menu(p);
    else p.sendMessage('§7Use the green pedestal to play. During a round, select your compass and sneak for the menu.');
  });
});

system.runInterval(() => {
  for (const p of world.getAllPlayers()) {
    if (!p.hasTag('rh_home') && !p.hasTag('rh_play')) continue;
    giveMenu(p);
    const inventory = p.getComponent('minecraft:inventory')?.container;
    const selected = inventory?.getItem(p.selectedSlotIndex);
    const pressed = p.isSneaking && selected?.typeId === 'minecraft:compass';
    if (pressed && !held.has(p.id)) { held.add(p.id); menu(p); }
    if (!pressed) held.delete(p.id);
  }
  const present = new Set(world.getAllPlayers().map(p => p.id));
  for (const id of held) if (!present.has(id)) held.delete(id);
}, 5);

world.afterEvents.playerSpawn.subscribe(event => {
  system.runTimeout(() => {
    const p = event.player;
    if (!event.initialSpawn && p.hasTag('rh_play')) { command(p, 'stop'); return; }
    enterLobby(p);
  }, 20);
});

// Also handle players already present when this version loads.
system.runTimeout(() => {
  for (const player of world.getAllPlayers()) enterLobby(player);
}, 40);

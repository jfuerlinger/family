# Use cases

This page lists **every current FamilyHub use case**, with screenshots from a running app. A family shares tasks, events, and mind maps in one place. There are no private lists: what you see, the whole family sees.

Screenshots use the demo family “Familie Muster”. Most UI shots are in German (the default locale). Phone navigation is the bottom tab bar; desktop uses the sidebar.

---

## 1. Create an account and sign in

### Sign in

Open FamilyHub, enter **email** and **password**, then **Sign in**. You stay signed in until you sign out.

![Sign in](../images/01-login.png)

### Wrong credentials

A mismatch shows an error. There is no in-app “forgot password” flow yet.

![Wrong credentials](../images/02-login-fehler.png)

### Register

**Register** with **your name**, **email**, and a **password** (at least 8 characters). Each family member needs their own email address.

![Create an account](../images/03-registrieren.png)

### Create or join a family

Right after registration: **Create a new family** (you are first) or **Join a family** with an invite code.

![Onboarding](../images/04-onboarding.png)

| Use case | Where | Outcome |
| --- | --- | --- |
| Create an account | Register | Own account, no family yet |
| Create a family | Onboarding | You become admin and get an invite code |
| Join a family | Onboarding | Same lists, events, and mind maps as everyone else |
| Sign in | Login | Back to the overview |
| Sign out | Desktop sidebar | Session ends |

---

## 2. See what is coming up

**Overview** is the home after login: open tasks, events today, mind maps, plus the next tasks and events.

![Overview, desktop](../images/05-uebersicht.png)

![Overview, phone](../images/21-uebersicht-mobil.png)

| Use case | What you see |
| --- | --- |
| Start of day | Greeting, counts, what is on today |
| Due today / overdue | Tasks with a due date on the overview |
| Events today / next days | Cards with color, time, and location |
| Jump in | Cards and “View all” open tasks, calendar, or mind maps |

---

## 3. Organize tasks

### Lists

Tasks live in lists such as “Haushalt” (household). Each list has a name and a color.

![Task lists](../images/06-aufgaben-listen.png)

![Create a list](../images/07-aufgaben-liste-erstellen.png)

![Lists on a phone](../images/22-aufgaben-mobil.png)

### Tasks in a list

Open a list to see open and completed tasks, add one from the quick field, check items off, or edit them.

![Tasks in a list](../images/08-aufgaben-liste.png)

![Edit a task](../images/09-aufgaben-bearbeiten.png)

| Use case | Steps |
| --- | --- |
| Create a list | Tasks → **New list** → name + color → create |
| Rename / recolor | Open list → **Edit list** |
| Delete a list | Open list → **Delete list** (also deletes every task in it) |
| Add a task | Open list → quick field or **Add** |
| Set a due date | Open the task → due date |
| Set priority | Low, medium, or high |
| Assign | One family member, or nobody |
| Notes | Details, links, reminders |
| Complete | Tap the checkbox; tap again to undo |
| Delete a task | Open the task → **Delete task** |

---

## 4. Plan family events

The **calendar** shows the month, colored marks on days, and the agenda for the selected day.

![Calendar](../images/10-kalender.png)

![Calendar on a phone](../images/23-kalender-mobil.png)

### Create or edit an event

![Create an event](../images/11-kalender-termin-erstellen.png)

![Edit an event](../images/12-kalender-termin-bearbeiten.png)

| Use case | Steps |
| --- | --- |
| Change month | Arrows or **Today** |
| Inspect a day | Tap the day in the grid |
| Timed event | **New event** → title, date, start/end, optional location, notes, color |
| All-day event | Check **All day** (birthday, holiday, trip) |
| Edit | Tap the row in the day agenda |
| Delete | **Delete** in the dialog (with confirmation) |

Recurring events (“every Tuesday practice”) are not supported yet — create them one by one.

---

## 5. Decide with mind maps

Mind maps collect options, pros, cons, and open questions — vacation, a pet, a purchase.

![Mind map list](../images/13-mindmaps.png)

![Create a mind map](../images/14-mindmap-erstellen.png)

![Mind maps on a phone](../images/24-mindmaps-mobil.png)

### Work in the editor

![Mind map editor](../images/15-mindmap-editor.png)

Select a node: a bar appears to **add** (idea, pro, con, question), edit, or delete.

![Add a node](../images/16-mindmap-knoten-hinzufuegen.png)

Double-tap opens the node dialog (text and kind).

![Edit a node](../images/17-mindmap-knoten-bearbeiten.png)

The grid icon in the top right runs **auto-layout** (vertical or horizontal).

![Auto-layout](../images/18-mindmap-auto-layout.png)

| Use case | How |
| --- | --- |
| Create a mind map | **New mind map** → title, optional description |
| Rename | Title field in the editor or card actions |
| Delete | Card actions (with confirmation) |
| Idea / pro / con / question | Select a node → type in the bar |
| Change text | Double-tap or pencil |
| Move a node | Drag on the canvas |
| Tidy the map | Auto-layout vertical or horizontal |
| Save | Automatic; **Save** forces a write |

Two people editing the same map at once can overwrite each other. Take turns.

---

## 6. Profile, language, and family

![Settings](../images/19-einstellungen.png)

![Settings on a phone](../images/25-einstellungen-mobil.png)

| Use case | Where | Note |
| --- | --- | --- |
| Change your name | Profile → **Save** | Shown on tasks and the member list |
| Switch language | German or English | Only for you |
| Copy invite code | Family → **Copy** | Treat it like a house key |
| See members | Admin founded the family; everyone else is a member | Roles do not change permissions in the app |
| Sign out | Logout in the sidebar | Useful on a shared device |

You cannot change email or password in the app. Removing a member currently requires whoever runs the server.

---

## 7. English UI

Each member picks their own language. The same overview in English:

![Dashboard in English](../images/20-dashboard-en.png)

---

## 8. FamilyHub on a phone

The app is mobile-first: bottom tabs for **Overview**, **Tasks**, **Calendar**, **Mind maps**, **Settings**. Add it to the home screen (Safari: Share → Add to Home Screen; Chrome: Install app).

![Sign in on a phone](../images/26-login-mobil.png)

---

## What FamilyHub does not do yet

Known limits, not use cases:

- No in-app password reset
- One account cannot belong to several families
- No private lists or events
- No recurring events
- No push reminders
- No offline mode
- No live co-editing of a mind map
- No in-app member removal

See the [FAQ](faq.md). Deeper guides: [Getting started](getting-started.md), [Tasks](tasks.md), [Calendar](calendar.md), [Mind maps](mindmaps.md), [Settings](settings.md).

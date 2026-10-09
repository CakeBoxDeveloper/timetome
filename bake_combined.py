import bpy

# Знаходимо об'єкти
obj1 = bpy.data.objects.get('Empty')
obj2 = bpy.data.objects.get('Empty.001')

if not obj1 or not obj2:
    print("ERROR: objects not found:", [o.name for o in bpy.data.objects])
else:
    # Відновлюємо екшени з NLA треків якщо треба
    def get_action_from_nla(obj):
        if obj.animation_data and obj.animation_data.action:
            return obj.animation_data.action
        if obj.animation_data:
            for track in obj.animation_data.nla_tracks:
                for strip in track.strips:
                    if strip.action:
                        return strip.action
        return None

    a1 = get_action_from_nla(obj1)
    a2 = get_action_from_nla(obj2)
    print(f"Action1: {a1.name if a1 else None}")
    print(f"Action2: {a2.name if a2 else None}")

    if not a1 or not a2:
        print("ERROR: could not find actions")
    else:
        # Створюємо новий combined екшен
        combined = bpy.data.actions.new('CombinedAction')

        # Копіюємо fcurves з action1 (для obj1)
        for fc in a1.fcurves:
            new_fc = combined.fcurves.new(
                data_path='objects["' + obj1.name + '"].' + fc.data_path,
                index=fc.array_index,
                action_group=obj1.name
            )
            for kp in fc.keyframe_points:
                new_fc.keyframe_points.insert(kp.co.x, kp.co.y)
                new_kp = new_fc.keyframe_points[-1]
                new_kp.interpolation = kp.interpolation

        # Копіюємо fcurves з action2 (для obj2)
        for fc in a2.fcurves:
            new_fc = combined.fcurves.new(
                data_path='objects["' + obj2.name + '"].' + fc.data_path,
                index=fc.array_index,
                action_group=obj2.name
            )
            for kp in fc.keyframe_points:
                new_fc.keyframe_points.insert(kp.co.x, kp.co.y)
                new_kp = new_fc.keyframe_points[-1]
                new_kp.interpolation = kp.interpolation

        print(f"Created CombinedAction with {len(combined.fcurves)} fcurves")

        # Призначаємо обом об'єктам
        for obj in [obj1, obj2]:
            if not obj.animation_data:
                obj.animation_data_create()
            # Чистимо NLA
            obj.animation_data.nla_tracks.clear()
            obj.animation_data.action = combined

        print("Done! Both objects now use CombinedAction")
        print("Export GLB with Animation mode: Actions")

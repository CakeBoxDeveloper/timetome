import bpy

# Знаходимо обидва екшени
action1 = bpy.data.actions.get('EmptyAction')
action2 = bpy.data.actions.get('EmptyAction.001')

if not action1 or not action2:
    print("ERROR: actions not found")
    print("Available:", [a.name for a in bpy.data.actions])
else:
    # Копіюємо всі fcurves з action2 в action1
    for fc in action2.fcurves:
        # Знаходимо об'єкт що використовує action2
        obj2 = None
        for obj in bpy.data.objects:
            if obj.animation_data:
                # Перевіряємо NLA треки
                for track in obj.animation_data.nla_tracks:
                    for strip in track.strips:
                        if strip.action == action2:
                            obj2 = obj
                            break

        # Створюємо новий fcurve в action1 з data_path відносно obj2
        new_fc = action1.fcurves.new(
            data_path=fc.data_path,
            index=fc.array_index,
            action_group=obj2.name if obj2 else 'Empty.001'
        )
        # Копіюємо keyframe points
        for kp in fc.keyframe_points:
            new_fc.keyframe_points.insert(kp.co[0], kp.co[1])
            new_kp = new_fc.keyframe_points[-1]
            new_kp.interpolation = kp.interpolation
            new_kp.handle_left = kp.handle_left
            new_kp.handle_right = kp.handle_right

    print("Merged EmptyAction.001 into EmptyAction!")
    print("Now assign EmptyAction to Empty.001 and re-export GLB")

    # Призначаємо merged екшен Empty.001
    obj_001 = bpy.data.objects.get('Empty.001')
    if obj_001:
        if not obj_001.animation_data:
            obj_001.animation_data_create()
        obj_001.animation_data.action = action1
        print("Assigned EmptyAction to Empty.001")

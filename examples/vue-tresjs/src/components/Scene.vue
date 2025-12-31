<script setup lang="ts">
import { OrbitControls, ContactShadows } from '@tresjs/cientos';
import RotatingBox from './RotatingBox.vue';
import AnimatedSphere from './AnimatedSphere.vue';
import TorusGroup from './TorusGroup.vue';
import Ground from './Ground.vue';
import Lights from './Lights.vue';
</script>

<template>
  <!-- Lighting -->
  <Lights />
  
  <!-- Scene background -->
  <TresColor attach="background" :args="['#0a0a0f']" />
  <TresFog attach="fog" :args="['#0a0a0f', 10, 50]" />
  
  <!-- Ground plane with contact shadows -->
  <Ground />
  <ContactShadows
    :position="[0, -0.49, 0]"
    :opacity="0.4"
    :scale="10"
    :blur="2"
    :far="4"
  />
  
  <!-- Animated objects -->
  <RotatingBox :position="[-2, 1, 0]" />
  <AnimatedSphere :position="[2, 1, 0]" />
  <TorusGroup :position="[0, 2, -2]" />
  
  <!-- Camera controls -->
  <OrbitControls 
    :enableDamping="true"
    :dampingFactor="0.05"
    :minDistance="3"
    :maxDistance="20"
  />
</template>


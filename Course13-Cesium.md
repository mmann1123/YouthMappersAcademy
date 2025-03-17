---
title: "Module 13: Introduction to 3D Data"
author: "YouthMappers Academy"
date: "2024"
---

# Module 13: Introduction to 3D Data

## Overview

Welcome to Module 13 of the YouthMappers Academy. This module explores three-dimensional (3D) geospatial data, covering data formats, standards, and a wide range of applications in development. 

You will learn how 3D data is collected through technologies like LiDAR, photogrammetry, and ground surveying, and how it can be integrated into OpenStreetMap (OSM) for mapping urban and natural environments. We will also discuss best practices for visualizing 3D data using tools such as Cesium, QGIS, and ArcGIS.

3D geospatial data enhances decision-making, planning, and communication among development stakeholders, with critical applications in urban planning, disaster response, infrastructure management, and sustainability efforts aligned with the UN Sustainable Development Goals (SDGs).

### What you will learn:
- You will learn about three dimensional data formats, models and standards.
- You will explore the primary methods of collecting 3D geospatial data, including LiDAR, photogrammetry, InSAR, and ground surveying.
- You will compare and evaluate different three-dimensional data sources and tools
- You will explore key applications of 3D geospatial data, including urban planning, disaster response, environmental sustainability, and humanitarian mapping.
- You will learn about best practices and tools for three dimensional data visualization.
- You will develop hands-on skills in collecting and integrating simple 3D data in the field using mobile tools like FieldPapers and Vespucci.
- You will learn how three dimensional data can be incorporated into the OSM data model and the best tools and workflows to facilitate this. 


## Introduction to 3D Data

### What is 3D data?
In Geographic Information Systems (GIS), 3D data refers to spatial data that includes a third dimension—the Z-coordinate—which represents height, depth, or elevation. Unlike traditional 2D GIS, which maps features on a flat plane, 3D GIS enables more detailed, realistic, and interactive visualizations of geographic space. 

### **Why is 3D Data Important?**
 
3D GIS is widely used across various industries, including:
- Urban Planning – Visualizing city skylines, zoning impacts, and infrastructure projects.
- Disaster Response – Modeling floods, landslides, and evacuation routes.
- Architecture & Construction – Creating accurate 3D models of buildings and infrastructure.
- Environmental Studies – Analyzing terrain, climate change, and natural resource distribution.

### **How is 3D GIS Data Represented?**
 
3D GIS data is classified based on how it stores and represents the third dimension. The two primary formats are: 
- **Vector-based representation**s – Use points, lines, and polygons to define 3D objects.
- **Raster-based representations** – Use grid cells to model elevation (e.g., Digital Elevation Models).

### **Vector-Based 3D Data**

Vector data represents specific locations and objects in 3D space. It includes:
- **Points (Discrete Locations)** 

Points represent discrete locations in 3D space, defined by X (longitude), Y (latitude), and Z (height or elevation) coordinates. For example, points can indicate the location of a tree, a communication mast, or a sensor. In addition to spatial coordinates, they may include attributes such as the species of a tree, the model type of a sensor, or the ID number of a radio mast or antenna.

- **Polylines (Linear Features)**

 Polylines represent continuous objects such as roads, rivers, or utility lines in 3D space. Unlike simple 2D lines, each vertex in a polyline can have a unique Z-value, allowing it to capture elevation changes along its path.

- **Polygons (Surfaces)**

 Polygons represent bounded areas, such as building footprints or land parcels, with added height attributes to extend them into 3D space.

Polygons with height data are often referred to as "Extruded 2D Data" or "2.5D Data" because they are essentially 2D polygons with an associated height value, rather than fully detailed 3D models. This type of representation is commonly used for simple 3D features, such as buildings in a city model.

### **Sub 13.1.4: Raster-Based 3D Data**

Using a raster grid to represent elevation is commonly referred to as a Digital Elevation Model (DEM). A DEM consists of a grid of cells, where each cell stores the elevation value at that specific location on the Earth's surface. 

While DEMs are often classified as 2.5D—since they do not fully capture complex structures like overhangs—they serve as a foundation for 3D GIS applications.

DEMs are categorized into two main types:
- **Digital Terrain Models (DTMs)**: Represent the bare Earth’s surface, excluding buildings, trees, or other structures. They are used for topographic analysis and hydrological modeling.

- **Digital Surface Models (DSMs):** Capture both natural and man-made features, including buildings, vegetation, and infrastructure, providing a more detailed representation of the Earth’s surface.

By subtracting a DTM from a DSM, we can determine building heights, tree canopy cover, and other structural details—a crucial process for exposure mapping and urban analysis. Additionally, other topographical products can be derived from DTMs, such as slope and aspect, which help analyze terrain characteristics.

### **Advanced 3D Models**

Some applications require more detailed or flexible 3D representations to accurately capture complex surfaces and terrain features.

**1. Triangulated Irregular Networks (TINs):**

A TIN represents surfaces using non-uniformly spaced points connected by triangles. Each triangle vertex is assigned an elevation value, and together, these triangles form a continuous surface that represents terrain variations.

TINs are particularly useful for modeling terrain with varying resolutions, as they allow greater detail in areas with complex elevation changes while using fewer data points in flatter areas. This makes them an effective tool for topographic analysis, hydrological modeling, and 3D surface visualization.

**2. 3D Mesh Models**

3D mesh models consist of vertices, edges, and faces that together define the shape and structure of a 3D object. These models are widely used for visualizing buildings, terrain, and other complex structures with a high level of detail.

Mesh models can be highly detailed, making them useful for applications such as urban planning, simulations, and geospatial visualization. They are commonly used in 3D mapping software, game engines, and virtual reality environments to create realistic and interactive representations of geographic spaces.

**3. 3D Point Clouds:**

3D point clouds are collections of data points (XYZ coordinates) in three-dimensional space, typically generated by LiDAR or photogrammetry. These data points represent the shape and structure of objects or surfaces, making point clouds an essential tool for creating detailed 3D models of the Earth's surface, buildings, vegetation, and other physical features.

Point clouds are widely used in geospatial analysis, construction, and environmental modeling, as they provide highly accurate representations of real-world structures and landscapes.

```{tip}
[What is a Point Cloud?](https://www.youtube.com/watch?v=2crAfWZOgf0)...
``` 


###  **3D Data Standards**
3D geospatial data standards are essential for ensuring interoperability, accuracy, and consistency across different platforms and applications. Organizations like the Open Geospatial Consortium (OGC) and ISO have developed standards to facilitate the exchange and integration of 3D spatial data across industries. 

Notable standards include:
- CityGML – An XML-based data model designed for representing 3D urban environments.
- IndoorGML – Focuses on the modeling of indoor spaces for navigation and spatial analysis.
- 3D Tiles – A specification developed for efficient streaming and visualization of massive 3D geospatial datasets on the web.
- KML and COLLADA – Common formats that support 3D representations in platforms like Google Earth and CAD systems.


These standards are crucial for data sharing, reducing redundancy, and ensuring accuracy in 3D geospatial datasets. They play a key role in applications such as urban planning, environmental monitoring, navigation, and virtual reality experiences.

**3D Tiles:**
 3D Tiles is an open-source format designed to enable the efficient streaming and visualization of large-scale 3D geospatial datasets. This format optimizes rendering performance by breaking down complex 3D models into smaller, manageable chunks, allowing massive datasets to be displayed seamlessly in web-based and mobile applications.

Originally developed by Cesium in 2015 to facilitate streaming heterogeneous 3D geospatial datasets, 3D Tiles was later adopted as a community standard by the Open Geospatial Consortium (OGC) in 2019.


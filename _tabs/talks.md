---
layout: page
icon: fas fa-microphone-alt
order: 6
description: "Conference presentations and talks by Sinan Koparan on AI, large language models, and sports analytics research."
---

{% for talk in site.data.talks %}
<div class="pub-card">
  <h3>{{ talk.title }}</h3>
  <div class="pub-venue">{{ talk.venue }}, {{ talk.year }}</div>
  <div class="pub-links">
    {% for link in talk.links %}
    <a href="{{ link.url }}"><i class="{{ link.icon }}"></i> {{ link.label }}</a>
    {% endfor %}
  </div>
</div>
{% endfor %}

<template>
  <div class="container-fluid mt-4">
    <h1 class="h1 header"><span class="green-title">Available</span> Shifts</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-row>
      <b-col>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Reason</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Role</th>
              <th>Covered</th>
              <th>Priority</th>
              <th>Person Responsible</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in posts" :key="post.id">
              <!-- <td><img src="./assets/SC-blk-favicon.png"></td> -->
              <td>{{ post.id }}</td>
              <td>{{ post.name }}</td>
              <td>{{ post.reason }}</td>
              <td>{{ post.date }}</td>
              <td>{{ post.duration }}</td>
              <td>{{ post.role }}</td>
              <td>{{ post.covered }}</td>
              <td>{{ post.priority }}</td>
              <td>{{ post.personResponsible }}</td>
              <td class="text-right">
                <a href="#" @click.prevent="populatePostToEdit(post)">Edit</a> -
                <a href="#" @click.prevent="deletePost(post.id)">Delete</a>
              </td>
            </tr>
          </tbody>
        </table>
      </b-col>
    </b-row>
    <b-row>
       <b-col>
          <!-- If there is a model.id then it will display Edit Post ID, if not it will display Get your shift covered -->
        <b-card :title="(model.id ? 'Edit Post ID#' + model.id : 'Get Your Shift Covered')">
          <form @submit.prevent="savePost">
            <b-form-group label="Name">
              <b-form-input type="text" v-model="model.name"></b-form-input>
            </b-form-group>
            <b-form-group label="Reason">
              <b-form-input type="text" v-model="model.reason"></b-form-input>
            </b-form-group>
            <b-form-group label="Date">
              <b-form-input type="date" v-model="model.date"></b-form-input>
            </b-form-group>
            <b-form-group label="Duration">
              <b-form-input type="number" v-model="model.duration"></b-form-input>
            </b-form-group>
            <b-form-group label="Role">
              <b-form-input type="text" v-model="model.role"></b-form-input>
            </b-form-group>
            <b-form-group label="Priority">
              <b-form-radio-group id="radioPriority" v-model="model.priority" name="priority">
                <b-form-radio value="low">Low</b-form-radio>
                <b-form-radio value="high">High</b-form-radio>
                <b-form-radio value="urgent">Urgent</b-form-radio>
              </b-form-radio-group>
            </b-form-group>
            <div>
              <b-btn type="submit" variant="success">Post Shift</b-btn>
            </div>
          </form>
        </b-card>
      </b-col>
    </b-row>
    
  </div>
</template>

<style>
form {
  color:darkslategrey;
}
</style>


<script>
import api from '@/api'
export default {
  data () {
    return {
      loading: false,
      posts: [],
      model: {}
    }
  },
  async created () {
    this.refreshPosts()
  },
  methods: {
    async refreshPosts () {
      this.loading = true
      this.posts = await api.getPosts()
      this.loading = false
    },
    async populatePostToEdit (post) {
      this.model = Object.assign({}, post)
    },
    async savePost () {
      if (this.model.id) {
        await api.updatePost(this.model.id, this.model)
      } else {
        this.model.covered = false
        this.model.personResponsible = this.model.name
        await api.createPost(this.model)
      }
      this.model = {} // reset form
      await this.refreshPosts()
    },
    async deletePost (id) {
      if (confirm('Are you sure you want to delete this post?')) {
        // if we are editing a post we deleted, remove it from the form
        if (this.model.id === id) {
          this.model = {}
        }
        await api.deletePost(id)
        await this.refreshPosts()
      }
    }
  }
}
</script>
